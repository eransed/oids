//WS Setup
import type { IncomingMessage } from 'http'
import { CLOSED, CLOSING, CONNECTING, OPEN, WebSocketServer } from 'ws'
import { OIDS_WS_PORT } from './pub_config'
import { getLocalIp, ipport } from './net'

import { apiServer } from './apiServer'
import { start_host_server } from './host_server'
import { Collidable, MessageType, PhotonLaser, Session, Ship, SpaceObject, ThrustFlameAtom } from '../src/lib/interface'
import { dist2, error, info, Vec2, warn } from 'mathil'
import { createSpaceObject } from '../src/lib/factory'
import { GameHandler } from './game_handler'

import { findShip, updateShipExperienceAndLevel } from './api/ship/ship.services'
import dotenv from 'dotenv'
import { sessionHandler } from './sessions'
import { ApiError } from './api/utils/apiError'
import { StatusCodes } from 'http-status-codes'
import { decode, encode } from '@msgpack/msgpack'

dotenv.config()

// start ApiServer
apiServer()

// start host server
start_host_server()

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const pack = require("../package.json")
// const name_ver: string = pack.name + " " + pack.version
const name_ver = 'oids-0.4.0'
const serverGameEnabled = true
const WS_PORT = OIDS_WS_PORT

const server: WebSocketServer = new WebSocketServer({
  port: WS_PORT,
})

export let globalConnectedClients: Client[] = []

const game_handlers: GameHandler[] = []
const serverSessionHandler = sessionHandler(game_handlers, globalConnectedClients)

serverSessionHandler.startSessions()

export function createGame(sessionId: string) {
  const gameHandler = new GameHandler((clients: Client[], data: SpaceObject, sessionId: string | null) => {
    // info(`Sending to session: ${sessionId}`)
    const sendCount = serverBroadcast<SpaceObject>(data, clients, sessionId)
    // info (`SendCount: ${sendCount}`)
    if (sendCount > 0 && sessionId) {
      const sessionClients = getClientsFromSessionId(sessionId)
      // info(`Num: ${sessionClients.length}`)
      let somePlays = false
      for (let i = 0; i < sessionClients.length; i++) {
        // info(`Playing ${sessionClients[i].lastDataObject?.isPlaying}`)
        if (sessionClients[i].lastDataObject?.isPlaying) {
          somePlays = true
        }
      }

      if (somePlays === false) {
        gameHandler.quit_game()
      }
    }
  })

  gameHandler.game_session_start(sessionId)

  return gameHandler
}

interface clientUpdated {
  id: string
  updated: Date
}

// function debugData(so: SpaceObject) {
//   const logdata = {
//     name: so.name,
//     session: so.sessionId,
//     messageType: MessageType[so.messageType],
//     lastMessage: so.lastMessage,
//   }
//   console.log({ logdata })
// }

export class Client {
  ws: WebSocket
  req: IncomingMessage
  name: string
  dateAdded: Date
  lastDataObject: SpaceObject
  sessionId: string | null = null
  sendClientHistory: clientUpdated[] = []
  userId: string

  private nameHasBeenUpdated = false

  constructor(_ws: WebSocket, _req: IncomingMessage, _name: string, _dateAdded: Date, _userId: string) {
    this.ws = _ws
    this.req = _req
    this.name = _name
    this.dateAdded = _dateAdded
    this.addEventListeners()
    this.userId = _userId
    this.lastDataObject = createSpaceObject(_name)
  }

  setSessionId(id: string) {
    this.sessionId = id
  }

  updateNameOnce(newName: string) {
    if (!this.nameHasBeenUpdated) {
      const oldName: string = this.name
      this.name = newName
      this.nameHasBeenUpdated = true
      info(`Updated name: ${oldName} -> ${this.name}`)
    } else {
      console.error(`Multiple name updates for ${this.toString()}: newName="${newName}"`)
    }
  }

  updateIdOnce(newId: string) {
    const oldId: string = this.userId
    this.userId = newId
    info(`Updated userId: ${oldId} -> ${this.userId}`)
  }

  addEventListeners(): void {
    // info(`Adding event-listeners for ${this.toString()}`)

    this.ws.addEventListener('error', (e) => {
      warn(`Error on socket:`)
      console.log(e)
    })

    this.ws.addEventListener('close', () => {
      // globalConnectedClients = removeClientIfExisting(globalConnectedClients, this)
      info(`${this.toString()} has been disconnected, sending goodbye message to ${globalConnectedClients.length} other players...`)
      const offlineMessage: SpaceObject | null = this.lastDataObject
      if (offlineMessage) {
        offlineMessage.online = false
        offlineMessage.isPlaying = false
        broadcastToAllClients(this, globalConnectedClients, offlineMessage)
        globalConnectedClients = removeDisconnectedClients(globalConnectedClients)
        if (globalConnectedClients.length === 0) {
          info('No clients connected :(')
        }
      } else {
        warn("Can't send offlineMessage: No data has been recieved")
      }
    })

    this.ws.addEventListener('message', (event: MessageEvent) => {
      if (!event.data) {
        warn('No data sent by connected client')
        return
      }

      try {
        // const so: SpaceObject = JSON.parse(event.data)
        const so = decode(new Uint8Array(event.data)) as SpaceObject

        // debugData(so)
        so.serverVersion = name_ver

        for (const key in so) {
          this.lastDataObject[key as keyof SpaceObject] = so[key as keyof unknown]
        }

        this.sessionId = so.sessionId

        if (so.id !== this.userId) {
          this.updateIdOnce(so.id)
        }

        if (!this.nameHasBeenUpdated) {
          if (globalConnectedClients.length > 0) {
            globalConnectedClients.forEach((client) => {
              if (client === this && client.name === this.name) {
                client.updateNameOnce(so.name)
              }
            })
            so.online = true
            this.lastDataObject.online = true
            this.lastDataObject.messageType = MessageType.SESSION_UPDATE
            broadcastToAllClients(this, globalConnectedClients, this.lastDataObject)
          } else {
            info('No clients connected')
          }
        } else {
          if (serverGameEnabled) {
            handleGameLogic(this.lastDataObject)

            startGameOnRequest(this.lastDataObject)
            removeStoppedGames()
          }

          if (so.messageType === MessageType.SESSION_UPDATE || so.messageType === MessageType.LEFT_SESSION) {
            // this.lastDataObject.isPlaying = false
            broadcastToAllClients(this, globalConnectedClients, this.lastDataObject)
          } else if (so.messageType === MessageType.GAME_UPDATE) {
            broadCastToInGameClients(this, globalConnectedClients, so)
            //  info(`${this.name} with ${this.sessionId} broadcasts game info to possible ${globalConnectedClients.length}`)
          } else {
            broadcastToLobbyClients(this, globalConnectedClients, this.lastDataObject)
          }
        }
      } catch (e) {
        error(`Failed with: ${e}`)
      }
    })
  }

  toString(): string {
    return `${this.name} (${ipport(this.req)}, ${getReadyStateText(this.ws)}, added: ${this.dateAdded.toLocaleTimeString()})`
  }
}

//ToDo: Make so guestships also gets experience which can be saved to localstorage.
//This makes it possible to create a user at a later time and save the guestship progress in db
async function incrementExperience(so: SpaceObject) {
  const existingShip = await findShip(so.ship.id)

  if (existingShip) {
    updateShipExperienceAndLevel(so.ship.id).then((ship) => {
      if (ship) {
        const client = globalConnectedClients.find((c) => c.userId === so.id)

        so.messageType = MessageType.SHIP_UPDATE
        so.ship.experience = ship.experience
        so.ship.level = ship.level

        if (client) {
          broadcastToOneClient(so, client)
        }
      } else {
        throw new Error('No ship found, could not update.')
      }
    })
  }
}

function handleGameLogic(so: SpaceObject) {
  if (so.messageType === MessageType.GAME_UPDATE) {
    every20.tick(() => {
      incrementExperience(so)
    })

    for (let i = 0; i < game_handlers.length; i++) {
      if (game_handlers[i].tied_session_id === so.sessionId) {
        // Making a copy of so because:
        //Gamehandler need its own reference for handling shots etc,
        //but dont need to update the original.
        const soCopy = { ...so }

        // info(`handle game logic for ${so.sessionId}`)
        // do logic for the correct game...
        game_handlers[i].handleSpaceObjectUpdate(soCopy)
      }
    }
  }
}

function startGameOnRequest(so: SpaceObject) {
  if (so.messageType === MessageType.START_GAME) {
    for (let i = 0; i < game_handlers.length; i++) {
      if (game_handlers[i].tied_session_id === so.sessionId) {
        warn(`Game with session ${so.sessionId} is already created!`)
        return
      }
    }
    info(`Calling create game with ${so.sessionId}`)
    game_handlers.push(createGame(so.sessionId))
  }
}

function removeStoppedGames() {
  for (let i = 0; i < game_handlers.length; i++) {
    if (game_handlers[i].game_started === false) {
      const s = game_handlers.splice(i)
      if (s[0]) {
        info(`Removed game ${s[0].tied_session_id}`)
      }
    }
  }
}

function getReadyStateText(ws: WebSocket): string {
  const s: number = ws.readyState
  switch (s) {
    case CONNECTING:
      return 'CONNECTING'
    case CLOSED:
      return 'CLOSED'
    case OPEN:
      return 'OPEN'
    case CLOSING:
      return 'CLOSING'
    default:
      return 'UNKNOWN (' + s + ')'
  }
}

function addNewClientIfNotExisting(clients: Client[], clientConnection: Client): boolean {
  for (const c of clients) {
    if (c === clientConnection && c.name === clientConnection.name) {
      return false
    }
  }
  clients.push(clientConnection)
  return true
}

function removeDisconnectedClients(clients: Client[]): Client[] {
  // const lengthBefore: number = clients.length
  const disconnectedClients: Client[] = clients.filter((c: Client) => {
    return c.ws.readyState === CLOSED || c.ws.readyState === CLOSING
  })

  const connectedClients: Client[] = clients.filter((c: Client) => {
    return c.ws.readyState === OPEN || c.ws.readyState === CONNECTING
  })

  disconnectedClients.forEach((c) => {
    info(`Disconnected: ${c.toString()}`)
  })

  connectedClients.forEach((c) => {
    info(`Connected: ${c.toString()}`)
  })

  // const disconClientCount: number = lengthBefore - connectedClients.length
  // if (disconClientCount > 0) {
  //   info(`Removed ${disconClientCount} disconnected clients`)
  // }
  return connectedClients
}

// object is any non-primitive object ie not string, number, boolean, undefined, null etc. added in typescript 2.2
function broadcastToAllClients(skipSourceClient: Client, connectedClients: Client[], data: SpaceObject): void {
  for (const client of connectedClients) {
    if (skipSourceClient !== client && skipSourceClient.name !== client.name) {
      if (data.messageType === MessageType.LEFT_SESSION) {
        info(`${data.name} left the session -> ${client.name}`)
      }
      // client.ws.send(JSON.stringify(data))
      client.ws.send(encode(data, { forceFloat32: true }))
    }
  }
}

function broadcastToOneClient(data: SpaceObject, client: Client): void {
  // client.ws.send(JSON.stringify(data))
  client.ws.send(encode(data, { forceFloat32: true }))
}

//Checking distance between two players: sending client and recieving client.
//If closer than given condition as a number the function returns true and data is sent.
function proximityCheck(sendingClient: Client, recieveClient: Client): boolean {
  if (sendingClient.lastDataObject && recieveClient.lastDataObject) {
    const sendClientPos = sendingClient.lastDataObject.cameraPosition
    const recieveClientPos = recieveClient.lastDataObject.cameraPosition

    return dist2(sendClientPos, recieveClientPos) < 5000 ? true : false
  } else return false
}

class Every {
  private currentTick = 0
  maxTicks = 1

  constructor(maxTicks: number) {
    this.maxTicks = maxTicks
  }

  tick(callback: () => void) {
    this.currentTick++
    if (this.currentTick >= this.maxTicks) {
      callback()
      this.currentTick = 0
    }
  }
}
// broadcastToAllClients

const every300 = new Every(300)

function broadcastToLobbyClients(sendingClient: Client, connectedClients: Client[], data: Partial<SpaceObject>): void {
  // info(`Sending:`)
  // debugData(data)
  for (const client of connectedClients) {
    if (sendingClient !== client && sendingClient.name !== client.name) {
      if (sendingClient.sessionId === client.sessionId) {
        client.ws.send(encode(data, { forceFloat32: true }))
      }
    }
  }
}

function broadCastToInGameClients(sendingClient: Client, connectedClients: Client[], data: Partial<SpaceObject>): void {
  // info(`Sending:`)
  // debugData(data)
  for (const client of connectedClients) {
    if (sendingClient !== client && sendingClient.name !== client.name) {
      if (sendingClient.sessionId === client.sessionId) {
        if (data.messageType === MessageType.GAME_UPDATE && client.lastDataObject.isPlaying) {
          if (shouldSendToClientInGame(sendingClient, client)) {
            client.ws.send(encode(data, { forceFloat32: true }))
          }
        }
      }
    }
  }
}

const every20: Every = new Every(300)

// For every tick this function is returning true which leads to shouldSendToClient
// function return true and that results in server broadcasting to other clients.
function tickUpdate(): boolean {
  let ticked = false

  every20.tick(() => {
    ticked = true
  })

  if (ticked) {
    ticked = false
    return true
  } else return false
}

function shouldSendToClientInGame(sendingClient: Client, recieveClient: Client): boolean {
  if (proximityCheck(sendingClient, recieveClient) || tickUpdate()) {
    return true
  } else return false
}

function serverBroadcast<T extends SpaceObject>(data: T, connectedClients: Client[], sessionId: string | null = null): number {
  let sendCount = 0
  if (sessionId === null) {
    for (const client of connectedClients) {
      // client.ws.send(JSON.stringify(data))
      client.ws.send(encode(data, { forceFloat32: true }))

      sendCount++
    }
  } else {
    for (const client of connectedClients) {
      if (client.sessionId === sessionId) {
        // info(`Sending to ${client.name} with session ${sessionId}`)
        // client.ws.send(JSON.stringify(data))
        client.ws.send(encode(data, { forceFloat32: true }))

        sendCount++
      }
    }
  }
  return sendCount
}

export function getClientsFromSessionId(sessionId: string): Client[] {
  const playerList: Client[] = []
  for (const client of globalConnectedClients) {
    if (sessionId === client.sessionId && client) {
      playerList.push(client)
    }
  }
  return playerList
}

export function getPlayersFromSessionId(sessionId: string): SpaceObject[] {
  const playerList: SpaceObject[] = []

  for (const client of globalConnectedClients) {
    if (sessionId === client.sessionId && client.lastDataObject) {
      playerList.push(client.lastDataObject)
    }
  }

  return playerList
}

export function getActivePlayersFromSession(sessionId: string): SpaceObject[] {
  const playerList: SpaceObject[] = []

  for (const client of globalConnectedClients) {
    if (sessionId === client.sessionId && client.lastDataObject) {
      if (client.lastDataObject.isPlaying) {
        playerList.push(client.lastDataObject)
      }
    }
  }

  return playerList
}

//Todo: createSessionId() should make unique sessionId's
//Then we can be certain sessionId's wont collide = breaking the game.
// export function getActivePlayerSessions() {
//   const sessionsSet: Set<Client["sessionId"]> = new Set()

//   const sessionList: string[] = []

//   for (const client of globalConnectedClients) {
//     sessionsSet.add(client.sessionId)
//   }

//   sessionsSet.forEach((v) => {
//     v && sessionList.push(v)
//   })

//   return sessionList
// }

export function getSessions(): Session[] {
  const sessions: Session[] = []
  console.log(serverSessionHandler.getSessions())

  try {
    for (let i = 0; game_handlers.length > i; i++) {
      const game_handler = game_handlers[i]

      if (game_handler.tied_session_id) {
        const players = getPlayersFromSessionId(game_handler.tied_session_id)

        sessions.push({ id: game_handler.tied_session_id, players: players })
      }
    }

    return sessions
  } catch (err) {
    throw new ApiError('Could not get sessions', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

server.on('connection', function connection(clientConnection: WebSocket, req: IncomingMessage) {
  const soService = createSpaceObject()
  soService.messageType = MessageType.SERVICE
  soService.serverVersion = name_ver
  clientConnection.send(encode(soService, { forceFloat32: true }))

  globalConnectedClients = removeDisconnectedClients(globalConnectedClients)

  const newClient: Client = new Client(clientConnection, req, `Client-${globalConnectedClients.length}`, new Date(), soService.id)
  if (addNewClientIfNotExisting(globalConnectedClients, newClient)) {
    info(`Storing new client ${newClient.toString()} in broadcast list`)
  }

  clientConnection.addEventListener('close', (ev) => {
    info(`Closed: ${newClient.toString()}, reason: ${ev.reason}`)
  })

  clientConnection.addEventListener('error', (err) => {
    info(`Error on socket connection: ${newClient.toString()}:`)
    console.log(err)
  })

  info(`${globalConnectedClients.length} connected clients:`)
  globalConnectedClients.forEach((c) => {
    info(`   ${c.toString()}`)
  })
})

server.on('error', (e) => {
  error(`Server end WS error: ${e.message}\n${e.stack}`)
})

server.on('close', () => {
  warn(`Server closed a WS connection`)
})

// console.log(getVersionInfo())
// info(getNameVersion())
info(`Starting ${name_ver}`)
info(`Listening on ws://localhost:${WS_PORT} and ws://${getLocalIp()}:${WS_PORT}\n`)

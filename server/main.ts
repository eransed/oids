//WS Setup
import type { IncomingMessage } from "http"
import { CLOSED, CLOSING, CONNECTING, OPEN, WebSocketServer } from "ws"
import { OIDS_WS_PORT } from "./pub_config"
import { getLocalIp, ipport } from "./net"

import { apiServer } from "./apiServer"
import { start_host_server } from "./host_server"
import { MessageType, Session, SpaceObject } from "../src/lib/interface"
import { error, info, log, warn } from "mathil"

// start ApiServer
apiServer()

// start host server
start_host_server()

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const pack = require("../package.json")
// const name_ver: string = pack.name + " " + pack.version
const name_ver = "oids-0.4.0"

const WS_PORT = OIDS_WS_PORT

const server: WebSocketServer = new WebSocketServer({
  port: WS_PORT,
})

let globalConnectedClients: Client[] = []

export class Client {
  ws: WebSocket
  req: IncomingMessage
  name: string
  dateAdded: Date
  lastDataObject: SpaceObject | null = null
  sessionId: string | null = null
  private nameHasBeenUpdated = false

  constructor(_ws: WebSocket, _req: IncomingMessage, _name: string, _dateAdded: Date) {
    this.ws = _ws
    this.req = _req
    this.name = _name
    this.dateAdded = _dateAdded
    this.addEventListeners()
  }

  setSessionId(id: string) {
    this.sessionId = id
  }

  updateNameOnce(newName: string) {
    if (!this.nameHasBeenUpdated) {
      const oldName: string = this.name
      this.name = newName
      this.nameHasBeenUpdated = true
      log(`Updated name: ${oldName} -> ${this.name}`)
    } else {
      console.error(`Multiple name updates for ${this.toString()}: newName="${newName}"`)
    }
  }

  addEventListeners(): void {
    // log(`Adding event-listeners for ${this.toString()}`)
    this.ws.addEventListener("close", () => {
      // globalConnectedClients = removeClientIfExisting(globalConnectedClients, this)
      log(`${this.toString()} has been disconnected, sending goodbye message`)
      const offlineMessage: SpaceObject | null = this.lastDataObject
      if (offlineMessage) {
        offlineMessage.online = false
        offlineMessage.isPlaying = false
        broadcastToAllClients(this, globalConnectedClients, offlineMessage)
        globalConnectedClients = removeDisconnectedClients(globalConnectedClients)
        if (globalConnectedClients.length === 0) {
          log("No clients connected :(")
        }
      } else {
        warn("Can't send offlineMessage: No data has been recieved")
      }
    })

    this.ws.addEventListener("message", (event: MessageEvent) => {
      if (!event.data) {
        warn("No data sent by connected client")
        return
      }

      try {
        const so: SpaceObject = JSON.parse(event.data)

        // log(`Got message: ${so.name}`)
        this.lastDataObject = so
        if (so.sessionId) this.sessionId = so.sessionId
        if (!this.nameHasBeenUpdated) {
          if (globalConnectedClients.length > 0) {
            globalConnectedClients.forEach((client) => {
              if (client === this && client.name === this.name) {
                client.updateNameOnce(so.name)
              }
            })
            so.online = true
            broadcastToSessionClients(this, globalConnectedClients, so)
          } else {
            log("No clients connected")
          }
        }
        if (so.messageType === MessageType.SESSION_UPDATE) {
          broadcastToAllClients(this, globalConnectedClients, so)
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

function getReadyStateText(ws: WebSocket): string {
  const s: number = ws.readyState
  switch (s) {
    case CONNECTING:
      return "CONNECTING"
    case CLOSED:
      return "CLOSED"
    case OPEN:
      return "OPEN"
    case CLOSING:
      return "CLOSING"
    default:
      return "UNKNOWN (" + s + ")"
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

// This function concept is not working, issues when updating with only one user.
// Always one closed client left in clients...
function removeClientIfExisting(clients: Client[], clientConnection: Client): Client[] {
  const lengthBefore: number = clients.length
  clients = clients.filter((c: Client) => {
    return c === clientConnection
  })
  const removedCount: number = lengthBefore - clients.length
  if (removedCount === 1) {
    log(`Removed client: ${clientConnection.toString()}`)
  } else if (removedCount > 1) {
    error(`Removed ${removedCount} equal clients in list`)
  }
  return clients
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
    log(`Disconnected: ${c.toString()}`)
  })

  connectedClients.forEach((c) => {
    log(`Connected: ${c.toString()}`)
  })

  // const disconClientCount: number = lengthBefore - connectedClients.length
  // if (disconClientCount > 0) {
  //   log(`Removed ${disconClientCount} disconnected clients`)
  // }
  return connectedClients
}

// object is any non-primitive object ie not string, number, boolean, undefined, null etc. added in typescript 2.2
function broadcastToAllClients(skipSourceClient: Client, connectedClients: Client[], data: SpaceObject): void {
  for (const client of connectedClients) {
    if (skipSourceClient !== client && skipSourceClient.name !== client.name) {
      client.ws.send(JSON.stringify(data))
    }
  }
}

function broadcastToSessionClients(sendingClient: Client, connectedClients: Client[], data: SpaceObject): void {
  for (const client of connectedClients) {
    if (sendingClient !== client && sendingClient.name !== client.name) {
      if (sendingClient.sessionId === client.sessionId) {
        log(`Sending ${data.lastMessage} to ${client.name}`)
        client.ws.send(JSON.stringify(data))
      }
    }
  }
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

  globalConnectedClients.forEach((client: Client) => {
    if (client.lastDataObject) {
      sessions.push({
        host: client.lastDataObject,
        id: client.lastDataObject.sessionId,
        players: getPlayersFromSessionId(client.lastDataObject.sessionId),
      })
    }
  })

  log(`returned: ${sessions.length} sessions`)

  return sessions
}

server.on("connection", function connection(clientConnection: WebSocket, req: IncomingMessage) {
  clientConnection.send(JSON.stringify({ serverVersion: name_ver }))
  globalConnectedClients = removeDisconnectedClients(globalConnectedClients)

  const newClient: Client = new Client(clientConnection, req, `Client-${globalConnectedClients.length}`, new Date())
  if (addNewClientIfNotExisting(globalConnectedClients, newClient)) {
    log(`Storing new client ${newClient.toString()} in broadcast list`)
  }

  log(`${globalConnectedClients.length} connected clients:`)
  globalConnectedClients.forEach((c) => {
    log(`   ${c.toString()}`)
  })
})

info(`Starting ${name_ver}`)
info(`Listening on ws://localhost:${WS_PORT} and ws://${getLocalIp()}:${WS_PORT}\n`)

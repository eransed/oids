//WS Setup
import type { IncomingMessage } from "http"
import type { SpaceObject } from "../src/lib/types"
import { soFromValueArray, soToValueArray } from "../src/lib/factory"
import { CLOSED, CLOSING, CONNECTING, OPEN, WebSocketServer } from "ws"
import { OIDS_WS_PORT } from "./pub_config"
import { getLocalIp, ipport } from "./net"

import { apiServer } from "./apiServer"
import { start_host_server } from "./host_server"

// start ApiServer
apiServer()

// start host server
start_host_server()

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const pack = require("../package.json")
// const name_ver: string = pack.name + " " + pack.version
const name_ver = "oids-0.3.0"

const WS_PORT = OIDS_WS_PORT

const server: WebSocketServer = new WebSocketServer({
  port: WS_PORT,
})

let globalConnectedClients: Client[] = []

class Client {
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
      console.log(`Updated name: ${oldName} -> ${this.name}`)
    } else {
      console.error(`Multiple name updates for ${this.toString()}: newName="${newName}"`)
    }
  }

  addEventListeners(): void {
    // console.log(`Adding event-listeners for ${this.toString()}`)
    this.ws.addEventListener("close", () => {
      // globalConnectedClients = removeClientIfExisting(globalConnectedClients, this)
      console.log(`${this.toString()} has been disconnected, sending goodbye message`)
      const offlineMessage: any = this.lastDataObject
      try {
        offlineMessage.online = false
      } catch (err) {
        console.error(err)
      }
      broadcastToAllClients(this, globalConnectedClients, offlineMessage)
      globalConnectedClients = removeDisconnectedClients(globalConnectedClients)
      if (globalConnectedClients.length === 0) {
        console.log("No clients connected :(")
      }
    })

    this.ws.addEventListener("message", (event: MessageEvent) => {
      const so: SpaceObject = soFromValueArray(JSON.parse(event.data))
      this.lastDataObject = so
      if (!this.nameHasBeenUpdated) {
        globalConnectedClients.forEach((client) => {
          if (client === this && client.name === this.name) {
            client.updateNameOnce(so.name)
          }
        })
      }
      so.online = true
      // broadcastToAllClients(this, globalConnectedClients, so);
      broadcastToSessionClients(this, globalConnectedClients, so)
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
    console.log(`Removed client: ${clientConnection.toString()}`)
  } else if (removedCount > 1) {
    console.error(`Removed ${removedCount} equal clients in list`)
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
    console.log(`Disconnected: ${c.toString()}`)
  })

  connectedClients.forEach((c) => {
    console.log(`Connected: ${c.toString()}`)
  })

  // const disconClientCount: number = lengthBefore - connectedClients.length
  // if (disconClientCount > 0) {
  //   console.log(`Removed ${disconClientCount} disconnected clients`)
  // }
  return connectedClients
}

// object is any non-primitive object ie not string, number, boolean, undefined, null etc. added in typescript 2.2
function broadcastToAllClients(skipSourceClient: Client, connectedClients: Client[], data: SpaceObject): void {
  for (const client of connectedClients) {
    if (skipSourceClient !== client && skipSourceClient.name !== client.name) {
      client.ws.send(JSON.stringify(soToValueArray(data)))
    }
  }
}

function broadcastToSessionClients(sendingClient: Client, connectedClients: Client[], data: SpaceObject): void {
  for (const client of connectedClients) {
    if (sendingClient !== client && sendingClient.name !== client.name) {
      if (sendingClient.sessionId === client.sessionId) {
        client.ws.send(JSON.stringify(soToValueArray(data)))
      }
    }
  }
}

server.on("connection", function connection(clientConnection: WebSocket, req: IncomingMessage) {
  clientConnection.send(JSON.stringify({ serverVersion: name_ver }))
  globalConnectedClients = removeDisconnectedClients(globalConnectedClients)

  const newClient: Client = new Client(clientConnection, req, `Client-${globalConnectedClients.length}`, new Date())
  if (addNewClientIfNotExisting(globalConnectedClients, newClient)) {
    console.log(`Storing new client ${newClient.toString()} in broadcast list`)
  }

  console.log(`${globalConnectedClients.length} connected clients:`)
  globalConnectedClients.forEach((c) => {
    console.log(`   ${c.toString()}`)
  })
})

console.log(`Starting ${name_ver}`)
console.log(`Listening on ws://localhost:${WS_PORT} and ws://${getLocalIp()}:${WS_PORT}\n`)

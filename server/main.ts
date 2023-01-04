import type { IncomingMessage } from 'http'
import { WebSocketServer } from 'ws'
import { getLocalIp } from './net'

// import {version, name} from './package.json';
// const name_ver: string = name + ' ' + version

const pack = require('./package.json')
const name_ver: string = pack.name + ' ' + pack.version

const PORT: number = 5000

const server = new WebSocketServer({
  port: PORT,
})

const clients: WebSocket[] = []

function addNewClientIfNotExisting(clients: WebSocket[], clientConnection: WebSocket) {
  for (let c of clients) {
    if (c === clientConnection) {
      return false
    }
  }
  clients.push(clientConnection)
}

// object is any non-primitive object ie not string, number, boolean, undefined, null etc. added in typescript 2.2
const broadcastToClients = (skipSourceClient: WebSocket, connectedClients: WebSocket[], data: object) => {
  for (let client of connectedClients) {
    if (skipSourceClient !== client) {
      client.send(JSON.stringify(data))
    }
  }
}

server.on('connection', function connection(clientConnection: WebSocket, req: IncomingMessage) {

  if (addNewClientIfNotExisting(clients, clientConnection)) {
    console.log('Added new client ' + req.socket.remoteAddress)
  }

  clientConnection.addEventListener('message', (event: MessageEvent) => {
    broadcastToClients(clientConnection, clients, JSON.parse(event.data))
  })
})

console.log('Starting ' + name_ver + ', listening on ws://' + getLocalIp() + ':' + PORT)

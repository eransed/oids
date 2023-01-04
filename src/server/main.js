import WebSocket, { WebSocketServer } from 'ws'

const server = new WebSocketServer({
  port: 5000,
})

let clients = []

const broadcastToClients = (connectedClients, data) => {
  for (let client of connectedClients) {
    client.send(JSON.stringify(data))
  }
}

server.on('connection', function connection(clientConnection) {
  clients.push(clientConnection)

  clientConnection.on('message', function message(data) {
    broadcastToClients(clients, JSON.parse(data))
  })
})

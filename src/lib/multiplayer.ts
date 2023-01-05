import { CLOSED, CLOSING, CONNECTING, OPEN } from 'ws'
import type { SpaceObject } from './types'

let socket: WebSocket

function connect() {
  return new Promise(function (resolve, reject) {
    socket = new WebSocket('ws://localhost:5000')
    socket.onopen = function () {
      resolve(socket)
    }
    socket.onerror = function (err) {
      reject(err)
    }
  })
}

export const initMultiplayer = async () => {
  console.log('from initMultiplayer')

  try {
    await connect()
    console.log('Connected to server')
  } catch (error) {
    console.error('Could not connect', error)
  }

  // socket.addEventListener('open', (event) => {
  //   socket.send('Hello Server!')
  // })

  // socket.addEventListener('message', (event) => {
  //   console.log('Message from server ', event.data)
  // })
}

export function getReadyState(): number {
  return socket.readyState
}

export function getReadyStateText(): string {
  const s: number = getReadyState()
  switch (s) {
    case WebSocket.CONNECTING:
      return 'CONNECTING'
    case WebSocket.CLOSED:
      return 'CLOSED'
    case WebSocket.OPEN:
      return 'OPEN'
    case WebSocket.CLOSING:
      return 'CLOSING'
    default:
      return '(' + s + ')'
  }
}

export const sendToServer = (messageObject: object) => {
  if (!socket) {
    console.error('Socket is undefined')
    return
  }
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(messageObject))
  } else {
    // console.error('Socket not open, readyState=' + socket.readyState)
  }
}

export function sendSpaceObjectToBroadcastServer(so: SpaceObject): void {
  // Remove array which could containg circular ref
  so.collidingWith = []
  so.isLocal = false
  sendToServer(so)
}

export const registerServerUpdate = (callback: (newObject: SpaceObject) => void): void => {
  socket.addEventListener('message', (event) => {
    callback(JSON.parse(event.data))
  })
}

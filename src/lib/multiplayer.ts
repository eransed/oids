import type { SpaceObject } from './types'

// Create WebSocket connection.
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
    console.log('connected')
  } catch (error) {
    console.error('could not connect', error)
  }

  // Connection opened
  socket.addEventListener('open', (event) => {
    socket.send('Hello Server!')
  })

  // Listen for messages
  // socket.addEventListener('message', (event) => {
  //   console.log('Message from server ', event.data)
  // })
}

export const sendToServer = (messageObject: object) => {
  if (!socket) {
    console.error('socket is undefined')
    return
  }
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(messageObject))
  } else {
    console.error('socket not open, readyState=' + socket.readyState)
  }
}

export const registerServerUpdate = (callback: (newObject: SpaceObject) => void): void => {
  socket.addEventListener('message', (event) => {
    callback(JSON.parse(event.data))
  })
}

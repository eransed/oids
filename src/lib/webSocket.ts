import type { ServerUpdate, SpaceObject } from "./types"
import { OIDS_WS_PORT } from "../../server/pub_config"
import { reduceShotSize, reduceSoSize, soFromValueArray, soToValueArray } from "./factory"

let socket: WebSocket
let serverVersion = "offline"
let connectionInfo = ""

export function getSerVer(): string {
  return serverVersion
}

export function isConnectedToWsServer(): boolean {
  return socket && socket.readyState === WebSocket.OPEN
}

export function getConnInfo(): string {
  return connectionInfo
}

export function getWsUrl(): URL {
  return new URL(`ws://${new URL(window.location.href).hostname}:${OIDS_WS_PORT}`)
}

function connect(): Promise<WebSocket> {
  return new Promise(function (resolve, reject) {
    const wsUrl: URL = getWsUrl()

    socket = new WebSocket(wsUrl)
    socket.onopen = function () {
      resolve(socket)
      console.log(socket)
    }
    socket.onerror = function (err) {
      reject(err)
    }
  })
}

export const initMultiplayer = async () => {
  try {
    await connect()
  } catch (error) {
    connectionInfo = ` - Connection to ${getWsUrl().href} failed`
  }
}

export function getReadyState(): number {
  return socket.readyState
}

export function getReadyStateText(): string {
  const s: number = getReadyState()
  switch (s) {
    case WebSocket.CONNECTING:
      return "CONNECTING..."
    case WebSocket.CLOSED:
      return "CLOSED"
    case WebSocket.OPEN:
      return "OPEN"
    case WebSocket.CLOSING:
      return "CLOSING..."
    default:
      return `UNKNOWN (${s})`
  }
}

export const sendToServer = (messageObject: object): void => {
  if (!socket) {
    console.error("Socket is undefined")
    return
  }
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(messageObject))
  } else {
    console.error("Socket not open, readyState=" + socket.readyState)
  }
}

export function sendSpaceObjectToBroadcastServer(so: SpaceObject): void {
  // Remove array which could contain circular ref
  so.collidingWith = []
  so.isLocal = false

  so = reduceSoSize(so)
  so.shotsInFlight.forEach((v) => {
    v = reduceShotSize(v)
  })

  sendToServer(soToValueArray(so))
}

export const registerServerUpdate = (callback: (su: ServerUpdate) => void): void => {
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data)
    if (data.serverVersion) {
      serverVersion = data.serverVersion
    } else {
      const spaceObjFromSrv: SpaceObject = soFromValueArray(data)
      spaceObjFromSrv.isLocal = false
      const serverUpdate: ServerUpdate = {
        spaceObjectByteSize: new TextEncoder().encode(JSON.stringify(spaceObjFromSrv)).length,
        unparsedDataLength: event.data.length,
        numberOfSpaceObjectKeys: Object.keys(spaceObjFromSrv).length,
        spaceObject: spaceObjFromSrv,
      }
      callback(serverUpdate)
    }
  })
}

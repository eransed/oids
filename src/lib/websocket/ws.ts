import { OIDS_WS_PORT } from "../../../server/pub_config"
import type { ServerUpdate, SpaceObject } from "../interface"

export function getWsUrl(port = OIDS_WS_PORT): URL {
  return new URL(`ws://${new URL(window.location.href).hostname}:${port}`)
}

export function getReadyState(socket: WebSocket): number {
  return socket.readyState
}

export function getReadyStateText(socket: WebSocket): string {
  const s: number = getReadyState(socket)
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

export function sender(ws: WebSocket, messageObject: object): boolean {
  if (ws.readyState === 1) {
    console.log("Sending message...")
    ws.send(JSON.stringify(messageObject))
    return true
  } else {
    console.error("Socket not open, readyState=" + ws.readyState)
    return false
  }
}

export class OidsSocket {
  private wsurl: URL
  private ws: WebSocket | null = null
  private prettyStatusString = "Just created!"

  constructor(url: URL) {
    console.log("New socket created")
    this.wsurl = url
  }

  private socketNotInitErrorMessage(extra = ""): string {
    const msg = "WebSocket not initialized " + extra
    console.error(msg)
    return msg
  }

  private connectPromise(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wsUrl: URL = this.wsurl

      this.ws = new WebSocket(wsUrl)
      this.ws.onopen = () => {
        if (this.ws) {
          resolve(this.ws)
        } else {
          this.socketNotInitErrorMessage()
        }
      }
      this.ws.onerror = (err) => {
        reject(err)
      }
    })
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  async connect() {
    try {
      await this.connectPromise()
        .then((ws) => {
          console.log(`WebSocket connected with status ${getReadyStateText(ws)}`)
        })
        .catch((err) => {
          console.error(`WebSocket failed to connect: ${err}`)
        })
    } catch (error) {
      this.prettyStatusString = ` - Connection to ${this.wsurl.href} failed`
    }
  }

  send(messageObject: object): void {
    if (!this.ws) {
      console.log("Connecting websocket...")
      this.connectPromise()
        .then((ws) => {
          sender(ws, messageObject)
        })
        .catch((err) => {
          console.error("Failed to send ", err)
        })
    } else {
      sender(this.ws, messageObject)
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
    } else {
      this.socketNotInitErrorMessage()
    }
  }

  getStateString(): string {
    if (this.ws) {
      return getReadyStateText(this.ws)
    }
    return this.socketNotInitErrorMessage()
  }

  getStatusString(): string {
    return this.prettyStatusString
  }

  addListener(callback: (su: ServerUpdate) => void): void {
    if (!this.ws) {
      console.log("trying to connect")
      this.connect()
    }
    this.ws?.addEventListener("message", (event: any) => {
      const data = JSON.parse(event.data)
      const spaceObjFromSrv: SpaceObject = data
      spaceObjFromSrv.isLocal = false
      const serverUpdate: ServerUpdate = {
        spaceObjectByteSize: new TextEncoder().encode(JSON.stringify(spaceObjFromSrv)).length,
        unparsedDataLength: event.data.length,
        numberOfSpaceObjectKeys: Object.keys(spaceObjFromSrv).length,
        spaceObject: spaceObjFromSrv,
      }
      callback(serverUpdate)
    })
  }
}

export function sendSpaceObject(ows: OidsSocket, so: SpaceObject): void {
  // Remove array which could contain circular ref
  so.collidingWith = []
  so.isLocal = false
  ows.send(so)
  console.log(so.name)
  console.log(so.lastMessage)
}

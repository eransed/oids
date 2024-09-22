// import { info, warn } from 'mathil'
import { OIDS_WS_PORT } from '../../../server/pub_config'
import { MessageType, type ServerUpdate, type SpaceObject } from '../interface'
import { logError, logInfo, logWarning } from '../../stores/alertHandler'

export function getWsUrl(port = OIDS_WS_PORT): URL {
  if (typeof window !== 'undefined') {
    return new URL(`ws://${new URL(window.location.href).hostname}:${port}`)
  } else {
    return new URL(`ws://${new URL('http://localhost').hostname}:${port}`)
  }
}

export function getReadyState(socket: WebSocket): number {
  return socket.readyState
}

export function getReadyStateText(socket: WebSocket): string {
  const s: number = getReadyState(socket)
  switch (s) {
    case WebSocket.CONNECTING:
      return 'CONNECTING...'
    case WebSocket.CLOSED:
      return 'CLOSED'
    case WebSocket.OPEN:
      return 'OPEN'
    case WebSocket.CLOSING:
      return 'CLOSING...'
    default:
      return `UNKNOWN (${s})`
  }
}

export function sender(ws: WebSocket, messageObject: object): boolean {
  if (ws.readyState === 1) {
    // log("Sending message...")
    ws.send(JSON.stringify(messageObject))
    return true
  } else {
    logError('Socket not open, readyState=' + ws.readyState)
    return false
  }
}

export class OidsSocket {
  private wsurl: URL
  private ws: WebSocket | null = null
  private prettyStatusString = 'Just created!'
  private sockMsgListener: SocketListener<'message'> | null = null
  private connectInitialized = false

  constructor(url: URL) {
    logInfo('New socket created')
    this.wsurl = url
  }

  private socketNotInitErrorMessage(extra = ''): string {
    const msg = 'WebSocket not initialized ' + extra
    console.error(msg)
    return msg
  }

  private connectPromise(): Promise<WebSocket> {
    this.connectInitialized = true
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
    if (this.isConnected() === false) {
      try {
        await this.connectPromise()
          .then((ws) => {
            logInfo(`WebSocket connected with status ${getReadyStateText(ws)}`)
            this.prettyStatusString = ''
          })
          .catch((err) => {
            logWarning(`WebSocket failed to connect: ${err}`)
            this.prettyStatusString = ` - Connection to ${this.wsurl.href} failed 1`
          })
      } catch (error) {
        this.prettyStatusString = ` - Connection to ${this.wsurl.href} failed 2`
      }
    } else {
      logInfo('Already connected to websocket')
    }
  }

  send(messageObject: object): void {
    if (!this.ws) {
      if (this.connectInitialized) {
        logWarning(`connectPromise already started!`)
      }
      console.log('Connecting websocket...')
      this.connectPromise()
        .then((ws) => {
          sender(ws, messageObject)
        })
        .catch((err) => {
          logError('Failed to send ', err)
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

  addListener(callbackSo: (su: ServerUpdate<SpaceObject>) => void, callbackNpc: (su: ServerUpdate<SpaceObject>) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.ws) {
        logInfo('trying to connect')
        this.connect()
      }

      this.sockMsgListener = {
        event: 'message',
        fn: (event: MessageEvent) => {
          const data = JSON.parse(event.data)

          // if (!data.messageType) {
          //   console.error(data)
          //   throw new Error('Unvalid json')
          // }

          function serverUpdateObject<T extends SpaceObject>(data: T): ServerUpdate<T> {
            const serverUpdate: ServerUpdate<T> = {
              spaceObjectByteSize: new TextEncoder().encode(JSON.stringify(data)).length,
              unparsedDataLength: event.data.length,
              numberOfSpaceObjectKeys: Object.keys(data).length,
              dataObject: data,
            }

            return serverUpdate
          }

          if (data.messageType === MessageType.SERVER_GAME_UPDATE) {
            const su = serverUpdateObject<SpaceObject>(data)
            callbackNpc(su)
          } else {
            const su = serverUpdateObject<SpaceObject>(data)
            su.dataObject = data
            su.dataObject.isLocal = false
            callbackSo(su)
          }
        },
      }

      this.ws?.addEventListener(this.sockMsgListener.event, this.sockMsgListener.fn)
      resolve()
    })
  }

  resetListeners(): void {
    if (this.sockMsgListener) {
      logInfo('Resetting socket listeners...')
      this.ws?.removeEventListener(this.sockMsgListener.event, this.sockMsgListener.fn)
    } else {
      logInfo('Did not remove any listeners')
    }
  }
}

export interface SocketListener<K extends keyof WebSocketEventMap> {
  event: K
  fn: (e: WebSocketEventMap[K]) => void
}

export function sendSpaceObject(ows: OidsSocket, so: SpaceObject): void {
  // Remove array which could contain circular ref
  so.collidingWith = []
  so.isLocal = false
  ows.send(so)
  console.log(so.name)
  console.log(so.lastMessage)
}

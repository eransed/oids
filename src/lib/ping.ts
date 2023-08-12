import { info, usPretty, warn } from "mathil"
import { type SpaceObject, MessageType } from "./interface"
import type { OidsSocket } from "./websocket/ws"
import { v4 as uuidv4 } from 'uuid'


export interface Ping {
  otherClientName: string
  sent: Date
  id: string
  latencyUs: number
  responded: boolean
}

const pingIdArray: Ping[] = []
const pingArrayMaxSize = 10

function averageLatencyUs() {
  let sum = 0
  let size = 0
  pingIdArray.forEach((p) => {
    if (p.latencyUs > 0) {
      sum += p.latencyUs
      size++
    }
  })
  if (size > 0) {
    return sum / size
  } else {
    return -1
  }
}

function handlePing(so: SpaceObject, socket: OidsSocket): void {
  if (so.messageType !== MessageType.PING) return

  if (so.ping === true) {
    info(`ping from: ${so.name}, ttl=${so.ttl}, rtt=${so.rtt}ms, hops=${so.hops}`)
    so.ping = false
    so.pingResponse = true
    so.hops++
    socket.send(so)
  } else if (so.pingResponse === true) {
    // checkJoinedSession()

    for (let i = 0; i < pingIdArray.length; i++) {
      const p = pingIdArray[i]
      if (p.id === so.pingId) {
        p.latencyUs = (new Date().valueOf() - p.sent.valueOf()) * 1000
        p.responded = true
        info(`ping response: ${p.id}, sent: ${p.sent}, latency: ${usPretty(p.latencyUs)}, average=${usPretty(averageLatencyUs())}`)
        if (pingIdArray.length > pingArrayMaxSize) {
          const diff = pingIdArray.length - pingArrayMaxSize
          if (diff > 1) {
            pingIdArray.splice(0, diff)
          } else {
            pingIdArray.splice(0, 1)
          }
        }
        return
      }
    }
    warn(`Unhandled ping response:`)
    console.log(so)
  }
}

function ping(so: SpaceObject, $socket: OidsSocket): void {
  info(`PING`)
  so.ping = true
  so.pingResponse = false
  so.pingId = uuidv4()
  so.messageType = MessageType.PING
  pingIdArray.push({
    otherClientName: so.name,
    sent: new Date(),
    id: so.pingId,
    latencyUs: -1,
    responded: false,
  })
  pingIdArray.forEach((p, idx) => {
    const currentLatencyUs = (new Date().valueOf() - p.sent.valueOf()) * 1000
    if (currentLatencyUs > 100) {
      warn(`high latency: ${usPretty(currentLatencyUs)}`)
      pingIdArray.splice(idx, 1)
      // checkJoinedSession()
    }
  })
  $socket.send(so)
}

function getPlayerPing(so: SpaceObject): string {
  let sumUs = 0
  let size = 0

  for (let i = 0; i < pingIdArray.length; i++) {
    const p = pingIdArray[i]
    if (so.name === p.otherClientName && p.responded === true) {
      sumUs += p.latencyUs
      size++
    }
  }

  if (size > 0) {
    return `(ping: ${usPretty(sumUs / size)})`
  }
  return ''
}


// pingTimer = setInterval(() => {
//   ping(localPlayer, $socket)
// }, 3000)

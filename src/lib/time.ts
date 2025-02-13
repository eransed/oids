import type { Game } from './game'
import { round2dec } from 'mathil'
import { updateShapes, updateSpaceObject, updateSpaceObjects } from './physics/physics'
import { clearScreen } from './render/render2d'
import { addDataPoint, newDataStats } from './stats'
import { renderFrameInfo } from './render/renderUI'
import { localPlayerStore } from '../stores/stores'
import { MessageType, type SpaceObject } from './interface'
import { reduceSoSize } from './websocket/util'
import { getPartialSo } from './websocket/deltaUpdates'
import { handleAxiosError } from './services/utils/errorHandler'

export class Every {
  private currentTick = 0
  maxTicks = 1

  constructor(maxTicks: number) {
    this.maxTicks = maxTicks
  }

  tick(callback: () => void) {
    this.currentTick++
    if (this.currentTick >= this.maxTicks) {
      callback()
      this.currentTick = 0
    }
  }
}

const fps_list_max_entries = 12
const fps_list: number[] = []
const fpsBuf = newDataStats()
fpsBuf.accUnit = ' frames'
fpsBuf.baseUnit = 'fps'
fpsBuf.label = 'FPS'

const frameTimes = newDataStats()
frameTimes.baseUnit = 'ms'
frameTimes.label = 'Frame time'

let frameCount = 0

export function getFps(dt: number) {
  const fps = round2dec(1000 / dt, 0)
  return fps
}

export function fpsCounter(ops: number, dt: number, game: Game, ctx: CanvasRenderingContext2D): void {
  const fps = getFps(dt)
  addDataPoint(fpsBuf, fps)
  addDataPoint(frameTimes, dt)
  const dtRounded = round2dec(dt, 1)
  fps_list.push(fps)
  if (fps_list.length >= fps_list_max_entries) {
    const afps: number = round2dec(fps_list.reduce((prev, cur) => prev + cur, 0) / fps_list_max_entries, 0)
    renderFrameInfo(ops, afps, dtRounded, frameCount, game, ctx)
    fps_list.shift()
  } else {
    renderFrameInfo(ops, fps, dtRounded, frameCount, game, ctx)
  }
}

function moveNewShotsToLocalBuffer(so: SpaceObject): void {
  so.shotsInFlight = [...so.shotsInFlight, ...so.shotsInFlightNew]
  so.shotsInFlightNew = []
}

export function shotHandler(so: SpaceObject): SpaceObject {
  so.shotsFiredThisFrame = false
  so.shotsInFlight = []
  if (so.shotsInFlightNew.length > 0) {
    so.shotsInFlight = so.shotsInFlightNew
  }
  so.shotsInFlightNew = []
  return so
}

export function copyObject(obj: SpaceObject): SpaceObject {
  if (obj.collidingWith) {
    const so = <SpaceObject>obj
    so.collidingWith = []
    return JSON.parse(JSON.stringify(so))
  }
  return JSON.parse(JSON.stringify(obj))
}

export function getSendableSpaceObject(so: SpaceObject): SpaceObject {
  so.collidingWith = []
  const so_copy: SpaceObject = <SpaceObject>copyObject(so)
  so_copy.messageType = MessageType.GAME_UPDATE
  so_copy.isLocal = false
  so_copy.online = true
  return reduceSoSize(shotHandler(so_copy))
}

const every20: Every = new Every(20)
const every300: Every = new Every(300)

const partialEnabled = true

/**
 * Fixed Timestep Render Loop:
 * - Uses a constant FIXED_DT for physics updates.
 * - Accumulates elapsed time to determine how many fixed updates to run.
 * - Renders once per frame.
 */
export function renderLoop(game: Game, renderFrame: (game: Game, interpolation: number) => void, nextFrame: (game: Game, dt: number) => void): () => Promise<number> {
  let fid: number
  let gameStopped: boolean = false
  let lastSent = 0
  const SEND_INTERVAL = 0 // Magic interval for sending updates to the server
  const FIXED_DT = 16.67 // Fixed timestep in milliseconds (~60 updates per second)
  let accumulator = 0
  let lastTime = performance.now()

  function update(timestamp: number): void {
    // Calculate elapsed time since the last frame
    let frameTime = timestamp - lastTime
    // Cap frameTime to avoid spiral of death
    const MAX_FRAME_TIME = 100
    if (frameTime > MAX_FRAME_TIME) {
      frameTime = MAX_FRAME_TIME
    }
    lastTime = timestamp
    accumulator += frameTime

    // Process fixed-timestep physics updates
    while (accumulator >= FIXED_DT) {
      // Update physics and input handling with a fixed dt
      updateSpaceObjects(game.remotePlayers, FIXED_DT)
      updateSpaceObject(game.localPlayer, FIXED_DT)
      updateSpaceObjects(game.bodies, FIXED_DT)
      nextFrame(game, FIXED_DT)
      accumulator -= FIXED_DT
      frameCount++
      every20.tick(() => localPlayerStore.set(game.localPlayer))
    }

    // Calculate interpolation factor for rendering
    const interpolation = accumulator / FIXED_DT

    // Clear and render the frame (you can choose to use interpolation for smooth rendering)
    clearScreen(game.ctx, game.style)
    renderFrame(game, FIXED_DT)

    // Network: send updated local player state if connected
    if (game.websocket.isConnected() && game.shouldSendToServer) {
      if (timestamp - lastSent >= SEND_INTERVAL) {
        const sendAbleSpaceObject = getSendableSpaceObject(game.localPlayer)
        // Attach the fixed dt (or you could attach interpolation if needed)
        sendAbleSpaceObject.dt = FIXED_DT
        const partialSo = getPartialSo(game.localPlayer, sendAbleSpaceObject)
        if (partialEnabled) {
          game.websocket.send(partialSo)
        } else {
          game.websocket.send(sendAbleSpaceObject)
        }
        lastSent = timestamp
      }
    }

    moveNewShotsToLocalBuffer(game.localPlayer)
    fid = requestAnimationFrame(update)
  }

  update(performance.now())

  async function stopper() {
    try {
      game.localPlayer.isPlaying = false
      // Inform peers that the player is stopping
      game.localPlayer.messageType = MessageType.GAME_UPDATE
      if (!gameStopped) {
        console.log('stopping game')
        game.websocket.send(game.localPlayer)
        game.localPlayer.messageType = MessageType.SESSION_UPDATE
        game.websocket.send(game.localPlayer)
      }
      cancelAnimationFrame(fid)
      gameStopped = true
      localPlayerStore.set(game.localPlayer)
      return fid
    } catch (err) {
      handleAxiosError(err)
      throw new Error('')
    }
  }

  return stopper
}

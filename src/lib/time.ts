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
let prevTimestamp: number
const fps_list: number[] = []
const max_dt = 16.67

const fpsBuf = newDataStats()
// fpsBuf.maxSize = 200
fpsBuf.accUnit = ' frames'
fpsBuf.baseUnit = 'fps'
fpsBuf.label = 'FPS'

const frameTimes = newDataStats()
frameTimes.baseUnit = 'ms'
// frameTimes.maxSize = 500
frameTimes.label = 'Frame time'

export function getFrameTimeMs(timestamp: number): number {
  if (prevTimestamp === 0) {
    prevTimestamp = timestamp
  }
  // todo: make sure not to return nan
  const frameTime = timestamp - prevTimestamp
  prevTimestamp = timestamp

  if (frameTime < max_dt) {
    return frameTime
  } else {
    return max_dt
  }
}

let frameCount = 0

export function getFps(dt: number) {
  const fps = round2dec(1000 / dt, 0)

  return fps
}

export function fpsCounter(ops: number, frameTimeMs: number, game: Game, ctx: CanvasRenderingContext2D): void {
  const fps = round2dec(1000 / frameTimeMs, 0)
  addDataPoint(fpsBuf, fps)
  addDataPoint(frameTimes, frameTimeMs)
  // renderGraph(fpsBuf, {x: 350, y: 100}, {x: 300, y: 70}, ctx)
  // renderGraph(frameTimes, {x: 350, y: 200}, {x: 300, y: 70}, ctx)
  const dt = round2dec(frameTimeMs, 0)
  fps_list.push(fps)
  if (fps_list.length >= fps_list_max_entries) {
    const afps: number = round2dec(fps_list.reduce((prev, cur) => prev + cur, 0) / fps_list_max_entries, 0)
    renderFrameInfo(ops, afps, dt, frameCount, game, ctx)
    fps_list.shift()
  } else {
    renderFrameInfo(ops, fps, dt, frameCount, game, ctx)
  }
}

function moveNewShotsToLocalBuffer(so: SpaceObject): void {
  // console.log(so.shotsInFlight)
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

export function renderLoop(game: Game, renderFrame: (game: Game, dt: number) => void, nextFrame: (game: Game, dt: number) => void): () => Promise<number> {
  let fid: number
  let gameStopped: boolean = false
  let lastSent = 0
  const SEND_INTERVAL = 0 //Try to find a magic interval of sending to server

  function update(timestamp: number): void {
    const oldSo = { ...game.localPlayer }
    frameCount++
    every20.tick(() => localPlayerStore.set(game.localPlayer))
    // every300.tick(() => console.log('remotes:', game.remotePlayers))
    const dt: number = getFrameTimeMs(timestamp)
    clearScreen(game.ctx, game.style)
    renderFrame(game, dt)

    updateSpaceObjects(game.remotePlayers, dt)
    updateSpaceObject(game.localPlayer, dt)
    updateSpaceObjects(game.bodies, dt)
    if (game.websocket.isConnected() && game.shouldSendToServer) {
      if (timestamp - lastSent >= SEND_INTERVAL) {
        const sendAbleSpaceObject = getSendableSpaceObject(game.localPlayer)
        const partialSo = getPartialSo(oldSo, sendAbleSpaceObject)
        // game.websocket.send(partialSo)
        partialSo.dt = dt
        game.websocket.send(partialSo)
        lastSent = timestamp
      }
    }
    moveNewShotsToLocalBuffer(game.localPlayer)
    fid = requestAnimationFrame(update)
    nextFrame(game, dt)
  }

  update(performance.now())

  async function stopper() {
    try {
      game.localPlayer.isPlaying = false
      // Game updates goes only to session peers
      game.localPlayer.messageType = MessageType.GAME_UPDATE
      if (!gameStopped) {
        console.log('stopping game')
        game.websocket.send(game.localPlayer)
        game.localPlayer.messageType = MessageType.SESSION_UPDATE
        game.websocket.send(game.localPlayer)
      }
      // sendSpaceObjectToBroadcastServer(game.localPlayer)

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

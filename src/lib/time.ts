import type { Game } from "./game"
import { round2dec } from "./math"
import { isConnectedToWsServer, sendSpaceObjectToBroadcastServer } from "./webSocket"
import { updateSpaceObjects } from "./physics"
import { clearScreen, renderFrameInfo } from "./render"
import { addDataPoint, newDataStats, renderGraph } from "./stats"

const fps_list_max_entries = 12
let prevTimestamp: number
const fps_list: number[] = []
const max_dt = 80

const fpsBuf = newDataStats()
fpsBuf.maxSize = 200
fpsBuf.accUnit = ' frames'
fpsBuf.baseUnit = 'fps'
fpsBuf.label = 'FPS'

export function getFrameTimeMs(timestamp: number): number {
  // todo: make sure not to return nan
  const frameTime = timestamp - prevTimestamp
  prevTimestamp = timestamp

  if (frameTime < max_dt) {
    return frameTime
  } else {
    return max_dt
  }
}

export function fpsCounter(ops: number, frameTimeMs: number, ver: string, ctx: CanvasRenderingContext2D): void {
  const fps = round2dec(1000 / frameTimeMs, 0)
  addDataPoint(fpsBuf, fps)
  renderGraph(fpsBuf, {x: 350, y: 300}, {x: 300, y: 100}, ctx)
  const dt = round2dec(frameTimeMs, 0)
  fps_list.push(fps)
  if (fps_list.length >= fps_list_max_entries) {
    const afps: number = round2dec(fps_list.reduce((prev, cur) => prev + cur, 0) / fps_list_max_entries, 0)
    renderFrameInfo(ops, afps, dt, ver, ctx)
    fps_list.shift()
  } else {
    renderFrameInfo(ops, fps, dt, ver, ctx)
  }
}

export function renderLoop(game: Game, renderFrame: (game: Game, dt: number) => void, nextFrame: (game: Game, dt: number) => void): () => Promise<number> {
  let fid: number

  function update(timestamp: number): void {
    const dt: number = getFrameTimeMs(timestamp)
    clearScreen(game.ctx)
    renderFrame(game, dt)
    // updateSpaceObject(game.localPlayer, dt, game.ctx)
    updateSpaceObjects(game.remotePlayers, dt, game.ctx)
    updateSpaceObjects(game.all, dt, game.ctx)
    if (isConnectedToWsServer() && game.shouldSendToServer) {
      sendSpaceObjectToBroadcastServer(game.localPlayer)
    }
    fid = requestAnimationFrame(update)
    nextFrame(game, dt)
  }

  update(0)

  function stopper(): Promise<number> {
    return new Promise<number>((resolve) => {
      if (isConnectedToWsServer()) {
        game.localPlayer.isPlaying = false

        sendSpaceObjectToBroadcastServer(game.localPlayer)
      }
      cancelAnimationFrame(fid)
      resolve(fid)

      // setTimeout(() => {
      //   cancelAnimationFrame(fid)
      //   resolve(fid)
      // }, 1000)
    })
  }

  return stopper
}

export function delayFrames(time: number) {
  for (let i = 0; i < time; i++) {
    console.log("Delay")
  }
}

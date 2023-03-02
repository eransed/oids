import type { Game } from './game'
import { round2dec } from './math'
import { isConnectedToWsServer, sendSpaceObjectToBroadcastServer } from './webSocket'
import { updateSpaceObjects } from './physics'
import { clearScreen, renderFrameInfo } from './render'

const fps_list_max_entries = 12
let prevTimestamp: number
const fps_list: number[] = []
const max_dt = 80

export function getFrameTimeMs(timestamp: number): number {
  // todo: make sure not to return nan
  const frameTime = timestamp - prevTimestamp
  prevTimestamp = timestamp

  if (frameTime < max_dt) {
    return frameTime
  } else {
    console.log (`Limits frametime ${frameTime} to ${max_dt}`)
    return max_dt
  }
}

export function fpsCounter(frameTimeMs: number, ver: string, ctx: CanvasRenderingContext2D): void {
  const fps = round2dec(1000 / frameTimeMs, 0)
  const dt = round2dec(frameTimeMs, 0)
  fps_list.push(fps)
  if (fps_list.length >= fps_list_max_entries) {
    const afps: number = round2dec(fps_list.reduce((prev, cur) => prev + cur, 0) / fps_list_max_entries, 0)
    renderFrameInfo(afps, dt, ver, ctx)
    fps_list.shift()
  } else {
    renderFrameInfo(fps, dt, ver, ctx)
  }
}

export function renderLoop(game: Game, renderFrame: (game: Game, dt: number) => void, nextFrame: (game: Game, dt: number) => void): () => Promise<number> {
  console.log('renderloop starting...')

  let fid: number

  function update(timestamp: number): void {
    const dt: number = getFrameTimeMs(timestamp)
    clearScreen(game.ctx)
    renderFrame(game, dt)
    // updateSpaceObject(game.localPlayer, dt, game.ctx)
    // updateSpaceObjects(game.remotePlayers, dt, game.ctx)
    updateSpaceObjects(game.all, dt, game.ctx)
    if (isConnectedToWsServer()) {
      sendSpaceObjectToBroadcastServer(game.localPlayer)
    }
    fid = requestAnimationFrame(update)
    nextFrame(game, dt)
  }

  update(0)

  console.log('renderloop started!')

  function stopper(): Promise<number> {
    return new Promise<number>((resolve) => {
      console.log ('resolving...')
      if (isConnectedToWsServer()) {
        game.localPlayer.online = false
        sendSpaceObjectToBroadcastServer(game.localPlayer)
      }
      cancelAnimationFrame(fid)
      resolve(fid)

      // setTimeout(() => {
      //   cancelAnimationFrame(fid)
      //   resolve(fid)
      // }, 1000)

      console.log ('after resolve')

    })
  }

  return stopper
}

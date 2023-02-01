import type { Game } from './game'
import { round2dec } from './math'
import { isConnectedToWsServer, sendSpaceObjectToBroadcastServer } from './webSocket'
import { updateSpaceObject, updateSpaceObjects } from './physics'
import { clearScreen, renderFrameInfo } from './render'
import type { SpaceObject } from './types'

const fps_list_max_entries = 12
let prevTimestamp: number
const fps_list: number[] = []

export function getFrameTimeMs(timestamp: number): number {
  // todo: make sure not to return nan
  const frameTime = timestamp - prevTimestamp
  prevTimestamp = timestamp
  return frameTime
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

export function renderLoop(game: Game, renderFrame: (game: Game, dt: number) => void, nextFrame: (game: Game, dt: number) => void) {
  console.log('renderloop start')

  function update(timestamp: number): void {
    // console.log('renderLoop runs...')
    const dt: number = getFrameTimeMs(timestamp)
    clearScreen(game.ctx)
    renderFrame(game, dt)
    // updateSpaceObject(game.localPlayer, dt, game.ctx)
    // updateSpaceObjects(game.remotePlayers, dt, game.ctx)
    updateSpaceObjects(game.all, dt, game.ctx)
    if (isConnectedToWsServer()) {
      sendSpaceObjectToBroadcastServer(game.localPlayer)
    }
    const frameId = requestAnimationFrame(update)
    if (game.shouldQuit() === true) {
      console.log('renderLoop stops')
      cancelAnimationFrame(frameId)
      clearScreen(game.ctx)
    }
    nextFrame(game, dt)
  }
  update(0)
}

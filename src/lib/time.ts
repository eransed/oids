import type { Game } from './game'
import { round2dec } from 'mathil'
// import { isConnectedToWsServer, sendSpaceObjectToBroadcastServer } from './websocket/webSocket'
import { updateShapes, updateSpaceObjects } from './physics'
import { clearScreen } from './render/render2d'
import { addDataPoint, newDataStats } from './stats'
import { renderFrameInfo } from './render/renderUI'
import { Every } from './gameModes/regular'
import { localPlayerStore } from '../pages/GamePage/components/Game/Utils/gameUtils'
import { MessageType } from './interface'

const fps_list_max_entries = 12
let prevTimestamp: number
const fps_list: number[] = []
const max_dt = 80

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
 // todo: make sure not to return nan
 const frameTime = timestamp - prevTimestamp
 prevTimestamp = timestamp

 if (frameTime < max_dt) {
  return frameTime
 } else {
  return max_dt
 }
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
  renderFrameInfo(ops, afps, dt, game, ctx)
  fps_list.shift()
 } else {
  renderFrameInfo(ops, fps, dt, game, ctx)
 }
}

const every20: Every = new Every(20)

export function renderLoop(game: Game, renderFrame: (game: Game, dt: number) => void, nextFrame: (game: Game, dt: number) => void): () => Promise<number> {
 let fid: number

 function update(timestamp: number): void {
  every20.tick(() => localPlayerStore.set(game.localPlayer))
  const dt: number = getFrameTimeMs(timestamp)
  clearScreen(game.ctx)
  renderFrame(game, dt)
  // updateSpaceObject(game.localPlayer, dt, game.ctx)
  updateSpaceObjects(game.remotePlayers, dt, game.ctx)
  updateSpaceObjects(game.all, dt, game.ctx)
  updateShapes(game.testShapes, dt)
  //   if (isConnectedToWsServer() && game.shouldSendToServer) {
  //    sendSpaceObjectToBroadcastServer(game.localPlayer)
  //   }
  if (game.websocket.isConnected() && game.shouldSendToServer) {
   game.localPlayer.messageType = MessageType.GAME_UPDATE
   // remove circ refs and make play non local
   game.localPlayer.collidingWith = []
   game.localPlayer.isLocal = false
   game.localPlayer.online = true
   game.websocket.send(game.localPlayer)
  }
  game.localPlayer.shotsFiredThisFrame = false
  fid = requestAnimationFrame(update)
  nextFrame(game, dt)
 }

 update(0)

 function stopper(): Promise<number> {
  return new Promise<number>((resolve) => {
   if (game.websocket.isConnected()) {
    game.localPlayer.isPlaying = false
    // Game updates goes only to session peers
    game.localPlayer.messageType = MessageType.GAME_UPDATE
    game.websocket.send(game.localPlayer)
    // sendSpaceObjectToBroadcastServer(game.localPlayer)
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

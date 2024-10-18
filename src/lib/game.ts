import { GameType, type SpaceObject } from './interface'
import { getContext } from './canvas_util'
import { LightSource, LineSegment } from './shapes'
import { renderLoop } from './time'
// import * as WelcomeScreen from './gameModes/welcomeScreen'
import { initRegularGame, nextFrame, renderFrame } from './gameModes/regular'
import type { OidsSocket } from './websocket/ws'
import { getCurrentStyle, syncThemeWithCss } from '../style/defaultColors'
import type { Star, UIStyle } from './interface'

export class Game {
  websocket: OidsSocket
  running = false
  type: GameType = GameType.SinglePlayer
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  localPlayer: SpaceObject
  remotePlayers: SpaceObject[] = []
  lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  segments: LineSegment[] = []
  gameOver = false
  bodies: SpaceObject[] = []
  all: SpaceObject[] = []
  shouldSendToServer = false
  hasCalledCallback = false
  OnDeadLocalPlayerCallBack: () => void
  stopper: (() => Promise<number>) | null = null
  serverVersion = '_unknown_server_version_'
  style: UIStyle = getCurrentStyle()
  stars: Star[] = []

  constructor(_canvas: HTMLCanvasElement, _localPlayer: SpaceObject, _websocket: OidsSocket, _OnDeadLocalPlayerCallBack: () => void) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
    this.websocket = _websocket
    this.OnDeadLocalPlayerCallBack = _OnDeadLocalPlayerCallBack
    this.ctx = getContext(this.canvas)
    syncThemeWithCss()
  }

  isRunning(): boolean {
    return this.running
  }

  shouldQuit(): boolean {
    return !this.running
  }

  stopGame = async (): Promise<void> => {
    this.localPlayer.isPlaying = false
    this.running = false
    this.shouldSendToServer = false
    this.localPlayer.isPlaying = false
    if (this.stopper) {
      await this.stopper()
    } else {
      console.error('stopper not init')
    }
  }

  startSingleplayer(): void {
    console.log('starts single')
  }

  clearBodies(): void {
    this.bodies = []
    this.all = []
  }

  callBackWrapper(): void {
    if (!this.hasCalledCallback) {
      this.hasCalledCallback = true
      this.OnDeadLocalPlayerCallBack()
    }
  }

  reset(): void {
    this.hasCalledCallback = false
    this.localPlayer.isDead = false
    this.localPlayer.obliterated = false
    this.localPlayer.deadFrameCount = 0

    this.clearBodies()
  }

  startMultiplayer(): void {
    // init a regular game
    this.shouldSendToServer = true
    this.localPlayer.isPlaying = true
    initRegularGame(this)

    this.running = true

    // start the animation loop
    this.stopper = renderLoop(this, renderFrame, nextFrame)
  }

  startGame(initFn: (g: Game) => void, renderFn: (game: Game, dt: number) => void, nextFn: (game: Game, dt: number) => void): void {
    this.shouldSendToServer = true
    this.localPlayer.isPlaying = true
    initFn(this)

    this.running = true

    // start the animation loop
    this.stopper = renderLoop(this, renderFn, nextFn)
  }
}

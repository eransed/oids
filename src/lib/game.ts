import { GameType, type SpaceObject } from './types'

import { getContext } from './canvas_util'

import { LightSource, LineSegment } from './shapes'
import { renderLoop } from './time'
import * as WelcomeScreen from './gameModes/welcomeScreen'
import * as Regular from './gameModes/regular'

export class Game {
  type: GameType = GameType.SinglePlayer
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  localPlayer: SpaceObject
  remotePlayers: SpaceObject[] = []
  lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  segments: LineSegment[] = []
  running = false
  gameOver = false
  bodies: SpaceObject[] = []
  all: SpaceObject[] = []
  OnDeadLocalPlayerCallBack: () => void
  hasCalledCallback: boolean = false

  constructor(_canvas: HTMLCanvasElement, _localPlayer: SpaceObject, _OnDeadLocalPlayerCallBack: () => void) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
    this.OnDeadLocalPlayerCallBack = _OnDeadLocalPlayerCallBack
    this.ctx = getContext(this.canvas)
  }

  isRunning(): boolean {
    return this.running
  }

  shouldQuit(): boolean {
    return !this.running
  }

  stopGame(): void {
    console.log('Stops game')
    this.running = false
    setTimeout(() => {
      this.startWelcomeScreen()
    }, 20)
  }

  startSingleplayer(): void {
    console.log('starts single')
  }

  startWelcomeScreen(): void {
    WelcomeScreen.initWelcomeScreen(this)
    renderLoop(this, WelcomeScreen.renderFrame, WelcomeScreen.nextFrame)
  }

  stopWelcomeScreen(): void {
    console.log('Stops welcomescreen')
    this.running = false
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
    console.log('reseting this ')
    this.hasCalledCallback = false
    this.localPlayer.isDead = false
    this.clearBodies()
  }

  startMultiplayer(): void {
    // init a regular game
    Regular.initRegularGame(this)

    // start the animation loop
    renderLoop(this, Regular.renderFrame, Regular.nextFrame)
  }
}

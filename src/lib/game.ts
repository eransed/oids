import { GameType, type SpaceObject, type KeyFunctionMap } from "./interface"

import { getContext } from "./canvas_util"

import { LightSource, LineSegment } from "./shapes"
import { renderLoop } from "./time"
import * as WelcomeScreen from "./gameModes/welcomeScreen"
import * as Regular from "./gameModes/regular"
import type { Shape } from "./shapes/Shape"

export class Game {
  testShapes: Shape[] = []
  private running = false
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
  keyFuncMap: KeyFunctionMap
  OnDeadLocalPlayerCallBack: () => void
  stopper: (() => Promise<number>) | null = null

  constructor(_canvas: HTMLCanvasElement, _localPlayer: SpaceObject, keyFuncMap: KeyFunctionMap, _OnDeadLocalPlayerCallBack: () => void) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
    this.OnDeadLocalPlayerCallBack = _OnDeadLocalPlayerCallBack
    this.ctx = getContext(this.canvas)
    this.keyFuncMap = keyFuncMap
  }

  isRunning(): boolean {
    return this.running
  }

  shouldQuit(): boolean {
    return !this.running
  }

  stopGame = async (): Promise<void> => {
    console.log("todo: build a better logger...")
    this.running = false
    this.shouldSendToServer = false
    this.localPlayer.isPlaying = false
    if (this.stopper) {
      await this.stopper()
    } else {
      console.error("stopper not init")
    }
  }

  startSingleplayer(): void {
    console.log("starts single")
  }

  startWelcomeScreen(): void {
    WelcomeScreen.initWelcomeScreen(this)
    this.stopper = renderLoop(this, WelcomeScreen.renderFrame, WelcomeScreen.nextFrame)
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
    console.log('Local player reset game')
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
    Regular.initRegularGame(this)

    this.running = true

    // start the animation loop
    this.stopper = renderLoop(this, Regular.renderFrame, Regular.nextFrame)
  }
}

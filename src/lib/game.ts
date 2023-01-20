import { GameType, type SpaceObject } from './types'

import { getContext } from './canvas_util'

import { LightSource, LineSegment } from './shapes'
import { multiPlayer } from './multiplayer'
import { welcomeScreen } from './welcomeScreen'

export class Game {
  type: GameType = GameType.SinglePlayer
  ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  localPlayer: SpaceObject
  private remotePlayers: SpaceObject[] = []
  lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  segments: LineSegment[] = []
  running = false

  constructor(_canvas: HTMLCanvasElement, _localPlayer: SpaceObject) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
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
    }, 10)
  }

  startSingleplayer(): void {
    console.log('starts single')
  }

  startWelcomeScreen(): void {
    welcomeScreen(this)
  }

  stopWelcomeScreen(): void {
    console.log('Stops welcomescreen')
    this.running = false
  }

  startMultiplayer(): void {
    multiPlayer(this)
  }
}

import {
  setCanvasSize,
  getScreenCenterPosition,
  getScreenRect,
  getScreenCenterPositionFromClient,
} from "../canvas_util"
import { randomAnyLightColor, randomBlue, randomAnyColor } from "../color"
import { initKeyControllers, spaceObjectKeyController } from "../input"
import { createSpaceObject } from "../factory"
import type { Game } from "../game"
import { add, rndfVec2d, rndi } from "../math"
import { bounceSpaceObject } from "../mechanics"
import { gravity } from "../physics"
import { loadingText, renderComet, renderMoon, renderShip } from "../render"
import { GameType, SpaceShape, type SpaceObject, type Vec2d } from "../types"

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
  }
  bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), 0.4, 0, 0)
  game.bodies.forEach((body) => {
    game.bodies.forEach((other) => {
      if (body !== other) {
        gravity(body, other)
      }
    })
    bounceSpaceObject(body, getScreenRect(game.ctx), 0.4, 0, 0)
  })
}

export function renderFrame(game: Game, dt: number): void {
  setCanvasSize(game.ctx)
  game.ctx.save()
  game.ctx.fillStyle = "#000"
  game.ctx.fill()
  game.ctx.beginPath()
  game.ctx.strokeStyle = "#f00"
  game.ctx.lineWidth = 10
  game.ctx.stroke()
  game.ctx.fill()
  game.ctx.restore()

  renderShip(game.localPlayer, game.ctx, true)

  game.bodies.forEach((body) => {
    if (body.shape === SpaceShape.Moon) {
      renderMoon(body, game.ctx)
    }

    if (body.shape === SpaceShape.Comet) {
      renderComet(body, game.ctx)
    }
  })
}

export function initWelcomeScreen(game: Game): void {
  if (game.isRunning()) {
    console.log("Game is already running")
    return
  }

  console.log("starts welcomescreen")
  game.type = GameType.WelcomeScreen

  loadingText("Loading...", game.ctx)

  initKeyControllers()

  const offset = 2000
  game.localPlayer.position = add(
    getScreenCenterPosition(game.ctx),
    rndfVec2d(-offset, offset)
  )

  const screenCenter = getScreenCenterPositionFromClient()

  //Local player init
  game.reset()
  game.localPlayer.mass = 0.1
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 100
  game.localPlayer.batteryLevel = 500
  game.localPlayer.steeringPower = 1.6
  game.localPlayer.enginePower = 0.25
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = "#f0f"
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 50
  game.localPlayer.position.x = screenCenter.x
  game.localPlayer.position.y = screenCenter.y
  console.log(
    "Your ship name is: " +
      game.localPlayer.name +
      "\nAnd your color is: " +
      game.localPlayer.color
  )

  //Moons
  for (let n = 0; n < 10; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Moon
    s.color = randomBlue()
    s.mass = 1
    s.isLocal = true
    s.size.y = rndi(10, 70)
    s.acceleration.x = 0
    s.acceleration.y = 0
    s.health = 0
    s.position = add(
      getScreenCenterPosition(game.ctx),
      rndfVec2d(-offset, offset)
    )
    game.bodies.push(s)
  }

  game.all = game.all.concat(game.bodies)
  game.all.push(game.localPlayer)
}

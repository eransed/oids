import { setCanvasSize, getScreenCenterPosition, getScreenRect } from './canvas_util'
import { randomAnyLightColor, randomBlue, randomLightGreen, randomRed } from './color'
import { createSpaceObject } from './factory'
import type { Game } from './game'
import { spaceObjectKeyController } from './input'
import { add, rndfVec2d, direction, linearTransform, rndi } from './math'
import { bounceSpaceObject, wrapSpaceObject } from './mechanics'
import { friction, gravity, handleCollisions } from './physics'
import { loadingText, renderComet, renderMoon } from './render'
import { renderLoop } from './time'
import { GameType, SpaceShape, type SpaceObject } from './types'

export const welcomeScreen = (game: Game) => {
  if (game.isRunning()) {
    console.log('Game is already running')
    return
  }

  game.running = true
  console.log('starts welcomescreen')
  game.type = GameType.WelcomeScreen

  //Needs to be a default canvas size so people get the same game size.
  setCanvasSize(game.ctx)
  loadingText('Loading...', game.ctx)
  //initKeyControllers()

  const offset = 2000

  // const game.localPlayer: SpaceObject = createSpaceObject()
  const bodies: SpaceObject[] = []

  let speedMin = -0.5
  let speedMax = 0

  //Moons
  for (let n = 0; n < 10; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Moon
    s.color = randomBlue()
    s.mass = 1
    s.isLocal = true
    s.size.y = rndi(10, 70)
    s.acceleration.x = rndi(speedMin, speedMax)
    s.acceleration.y = rndi(speedMin, speedMax)
    s.health = 0
    s.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
    bodies.push(s)
  }

  //Comets
  for (let n = 0; n < 10; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Comet
    s.color = randomAnyLightColor()
    s.mass = 2
    s.isLocal = true
    s.acceleration.x = rndi(speedMin, speedMax)
    s.acceleration.y = rndi(speedMin, speedMax)
    s.size.x = rndi(50, 80)
    s.size.y = rndi(50, 80)
    s.health = 0
    s.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
    bodies.push(s)
  }

  let all: SpaceObject[] = []
  all = all.concat(bodies)
  all.push(game.localPlayer)

  const renderFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    ctx.save()
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.beginPath()
    ctx.strokeStyle = '#f00'
    ctx.lineWidth = 10
    ctx.stroke()
    ctx.fill()
    ctx.restore()

    bodies.forEach((body) => {
      if (body.shape === SpaceShape.Moon) {
        renderMoon(body, ctx)
      }

      if (body.shape === SpaceShape.Comet) {
        renderComet(body, ctx)
      }
    })
  }

  const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    // wrapSpaceObject(ship, getScreenRect(ctx))
    //bounceSpaceObject(game.localPlayer, getScreenRect(ctx), 0.4, 0, 0)

    bodies.forEach((body) => {
      bodies.forEach((other) => {
        if (body !== other) {
          gravity(body, other)
        }
      })

      //gravity(body, game.localPlayer)

      wrapSpaceObject(body, getScreenRect(ctx))

      //bounceSpaceObject(body, getScreenRect(ctx), 0.4, 0, 0)
    })
  }
  renderLoop(game, renderFrame, nextFrame, bodies)
}

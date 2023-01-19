import { setCanvasSize, getScreenCenterPosition, getScreenRect } from './canvas_util'
import { randomAnyColor, randomBlue } from './color'
import { createSpaceObject } from './factory'
import type { Game } from './game'
import { initKeyControllers, spaceObjectKeyController } from './input'
import { add, rndfVec2d, rndi, sub, direction, linearTransform } from './math'
import { bounceSpaceObject } from './mechanics'
import { friction, gravity } from './physics'
import { loadingText, renderMoon } from './render'
import { LineSegment } from './shapes'
import { renderLoop } from './time'
import { GameType, SpaceShape, type SpaceObject } from './types'

export const welcomeScreen = (game: Game) => {
  if (game.isRunning()) {
    console.log('Game is already running')
    return
  }

  game.running = true
  console.log('starts multi')
  game.type = GameType.WelcomeScreen

  //Needs to be a default canvas size so people get the same game size.
  setCanvasSize(game.ctx)
  loadingText('Loading...', game.ctx)
  //initKeyControllers()

  const offset = 500

  // const game.localPlayer: SpaceObject = createSpaceObject()
  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
  game.localPlayer.mass = 0.1
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 250
  game.localPlayer.steeringPower = 0.55
  game.localPlayer.enginePower = 0.025
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = '#f0f'
  game.localPlayer.isLocal = true
  console.log('Your ship name is: ' + game.localPlayer.name + '\nAnd your color is: ' + game.localPlayer.color)

  const padding = 0
  const pad = { x: padding, y: padding }
  const scr = sub(getScreenRect(game.ctx), pad)
  game.segments.push(new LineSegment(pad, { x: scr.x, y: padding }, '#f00'))
  game.segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, '#00f'))
  game.segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, '#0f0'))
  game.segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

  const bodies: SpaceObject[] = []

  for (let n = 0; n < 2; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Moon
    s.color = randomBlue()
    s.mass = 5
    s.isLocal = true
    s.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
    bodies.push(s)
  }

  let all: SpaceObject[] = []
  all = all.concat(bodies)
  all.push(game.localPlayer)

  const renderFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    game.lightSource.position = game.localPlayer.position
    game.lightSource.direction = direction(game.localPlayer.angleDegree)

    const viewSlices = game.lightSource.shine(game.segments, ctx)
    const viewTopLeft = { x: 2500, y: 100 }
    const viewSize = { x: 25 * viewSlices.length, y: 15 * viewSlices.length }
    const viewSlizeWidth = Math.floor(viewSize.x / viewSlices.length)
    ctx.save()

    ctx.fillStyle = '#000'
    ctx.fillRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
    ctx.fill()

    ctx.beginPath()
    for (let i = 0; i < viewSlices.length; i++) {
      const roofFloorPad = 150
      const c = linearTransform(viewSlices[i].distance, 0, getScreenRect(ctx).x + 250, 255, 2)
      const h = linearTransform(viewSlices[i].distance, 0, getScreenRect(ctx).x, viewSize.y - roofFloorPad, roofFloorPad)
      const y = viewTopLeft.y + (viewSize.y - h) / 2
      ctx.fillStyle = viewSlices[i].color
      ctx.fillRect(viewTopLeft.x + viewSlizeWidth * i, y, viewSlizeWidth, h)
    }
    ctx.strokeStyle = '#f00'
    ctx.lineWidth = 10
    ctx.strokeRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
    ctx.stroke()
    ctx.fill()
    ctx.restore()

    for (const segs of game.segments) {
      segs.render(ctx)
    }

    bodies.forEach((body) => {
      renderMoon(body, ctx)
    })
  }

  const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    spaceObjectKeyController(game.localPlayer, dt)
    friction(game.localPlayer)
    // wrapSpaceObject(ship, getScreenRect(ctx))
    bounceSpaceObject(game.localPlayer, getScreenRect(ctx), 0.4, 0, 0)

    bodies.forEach((body) => {
      bodies.forEach((other) => {
        if (body !== other) {
          gravity(body, other)
        }
      })

      gravity(body, game.localPlayer)

      game.localPlayer.shotsInFlight.forEach((shot) => {
        gravity(body, shot)
      })

      friction(body)
      // wrapSpaceObject(body, getScreenRect(ctx))
      bounceSpaceObject(body, getScreenRect(ctx), 0.4, 0, 0)
    })
  }
  renderLoop(game, renderFrame, nextFrame, bodies)
}

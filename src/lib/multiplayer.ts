import type { Game } from './game'

import { GameType, SpaceShape, type SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { bounceSpaceObject } from './mechanics'
import { loadingText, renderExplosionFrame, renderMoon, renderShip, renderSpaceObjectStatusBar } from './render'
import { getScreenCenterPosition, getScreenRect, setCanvasSize } from './canvas_util'
import { friction, gravity, handleCollisions } from './physics'
import { add, direction, linearTransform, rndfVec2d, rndi, sub } from './math'
import { randomAnyColor } from './color'
import { fpsCounter, renderLoop } from './time'
import { test } from './test'
import { getSerVer, initMultiplayer, registerServerUpdate } from './webSocket'
import { LineSegment } from './shapes'

export const multiPlayer = (game: Game) => {
  if (game.isRunning()) {
    console.log('Game is already running')
    return
  }

  game.running = true
  console.log('starts multi')
  game.type = GameType.MultiPlayer
  if (!test()) {
    return
  }

  //Needs to be a default canvas size so people get the same game size.

  loadingText('Loading...', game.ctx)
  initKeyControllers()

  const offset = 500

  // const game.localPlayer: SpaceObject = createSpaceObject()
  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
  game.localPlayer.mass = 0.1
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 50
  game.localPlayer.steeringPower = 0.55
  game.localPlayer.enginePower = 0.025
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = '#f0f'
  game.localPlayer.isLocal = true
  console.log('Your ship name is: ' + game.localPlayer.name + '\nAnd your color is: ' + game.localPlayer.color)

  // if (getMenu(game.localPlayer.WelcomeMenu) === 'Startup') {
  //   console.log('Render Welcome Menu')
  //   game.localPlayer.WelcomeMenu = false
  //   //Can't import Svelte components to Typescript so I cant render it :(
  // }

  //if chosen multiplayer
  initMultiplayer()

  //if chosen singleplayer
  // ship.ExistingGame = true
  // ship.GameTypes.SinglePlayer = true

  const padding = 0
  const pad = { x: padding, y: padding }
  const scr = sub(getScreenRect(game.ctx), pad)

  // const padding2 = 650
  // const pad2 = {x: padding2, y: padding2}
  // const scr2 = sub(getScreenRect(ctx), pad2)
  // segments.push(new LineSegment(pad2, {x: scr2.x, y: padding2}))
  // segments.push(new LineSegment({x: scr2.x, y: padding2}, {x: scr2.x, y: scr2.y}))
  // segments.push(new LineSegment({x: scr2.x, y: scr2.y}, {x: padding2, y: scr2.y}))
  // segments.push(new LineSegment({x: padding2, y: scr2.y}, {x: padding2, y: padding2}))

  // segments.push(new LineSegment({x: 2000, y:200}, {x: 2000, y: 1000}))
  // segments.push(new LineSegment({x: 2400, y:300}, {x: 2300, y: 1600}))
  // segments.push(new LineSegment({x: 700, y:600}, {x: 1000, y: 1500}))
  // segments.push(new LineSegment({x: 200, y:700}, {x: 1400, y: 1000}))

  // document.addEventListener('mousemove', (event) => {
  // lightSource.position = getMousePosition(canvas, event)
  // const l = linearTransform(getMousePosition(canvas, event).y, 0, getScreenRect(ctx).y, 0, 100)
  // const hsl = new HSL(shade)
  // hsl.l = l
  // background = hsl.toHex()
  // console.log(background)
  // })

  const bodies: SpaceObject[] = []

  // for (let n = 0; n < 2; n++) {
  //   const s = createSpaceObject()
  //   s.shape = SpaceShape.Moon
  //   s.color = randomBlue()
  //   s.mass = 5
  //   s.isLocal = true
  //   s.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  //   bodies.push(s)
  // }

  let all: SpaceObject[] = []
  all = all.concat(bodies)
  all.push(game.localPlayer)

  let serverObjects: SpaceObject[] = []

  registerServerUpdate((so: SpaceObject) => {
    for (let i = 0; i < serverObjects.length; i++) {
      if (so.name === serverObjects[i].name) {
        if (!so.online) {
          console.log(`${so.name} went offline`)
        }
        serverObjects[i] = so

        return
      }
    }
    if (so.name !== game.localPlayer.name) {
      serverObjects.push(so)
      console.log(`New ship online: ${so.name}`)
    }
  })

  const render3DFrame = (ctx: CanvasRenderingContext2D) => {
    game.segments.push(new LineSegment(pad, { x: scr.x, y: padding }, '#f00'))
    game.segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, '#00f'))
    game.segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, '#0f0'))
    game.segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

    const viewSlices = game.lightSource.shine(game.segments, ctx)
    const viewTopLeft = { x: getScreenRect(ctx).x - 1200, y: 100 }
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
      // ctx.fillStyle = greyScale(c)
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
  }

  const renderFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    setCanvasSize(game.ctx)
    game.lightSource.position = game.localPlayer.position
    game.lightSource.direction = direction(game.localPlayer.angleDegree)

    // render3DFrame(ctx)

    serverObjects.forEach((so) => {
      if (so.shape === SpaceShape.Moon) {
        renderMoon(so, ctx)
      } else {
        if (so.health <= 0) {
          renderExplosionFrame(so.position, ctx)
          return
        } else renderShip(so, ctx, false)
      }
    })

    renderSpaceObjectStatusBar(serverObjects, game.localPlayer, ctx)
    // renderVector(ship.acceleration, ship.position, ctx, 400)
    // renderVector(ship.velocity, ship.position, ctx, 10)
    bodies.forEach((body) => {
      renderMoon(body, ctx)
    })

    fpsCounter(dt, getSerVer(), ctx)
    if (game.localPlayer.health <= 0) {
      renderExplosionFrame(game.localPlayer.position, ctx)
      // renderShip(game.localPlayer, ctx, true)
      return
    } else renderShip(game.localPlayer, ctx, true)
  }

  const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    if (game.localPlayer.health <= 0) {
      bounceSpaceObject(game.localPlayer, getScreenRect(ctx), 0.4, 0, 0)
      return
    }
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

    serverObjects = serverObjects.filter((so) => {
      return so.online || so.isLocal
    })

    const currentSpaceObjects = all.concat(serverObjects)

    handleCollisions(currentSpaceObjects, ctx)
  }
  renderLoop(game, renderFrame, nextFrame, bodies)
}
function getCanvas(): HTMLCanvasElement {
  throw new Error('Function not implemented.')
}

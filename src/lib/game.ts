import { SpaceShape, type SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { bounceSpaceObject, wrapSpaceObject } from './mechanics'
import { clearScreen, loadingText, renderMoon, renderOGShip, renderPoint, renderShip, renderSpaceObjectStatusBar } from './render'
import { createSpaceObject, getMousePosition, getScreenCenterPosition, getScreenRect, setCanvasSize } from './utils'
import { friction, gravity, handleCollisions, updateSpaceObject, updateSpaceObjects } from './physics'
import { add, direction, linearTransform, rndfVec2d, rndi, sub } from './math'
import { greyScale, HSL, randomAnyColor } from './color'
import { fpsCounter, getFrameTimeMs } from './time'
import { test } from './test'
import { getSerVer, initMultiplayer, isConnectedToWsServer, registerServerUpdate, sendSpaceObjectToBroadcastServer } from './multiplayer'
import { LightSource, LineSegment, Ray } from './shapes'
import { getMenu } from './menu'

let playerShip: SpaceObject

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  return canvas.getContext('2d')
}

export function getPlayerShip() {
  return playerShip
}

export async function game(canvas: HTMLCanvasElement) {
  if (!test()) {
    return
  }

  console.log('Starting oids...')

  const ctx = <CanvasRenderingContext2D>getContext(canvas)

  //Needs to be a default canvas size so people get the same game size.
  setCanvasSize(ctx)
  loadingText('Loading...', ctx)
  initKeyControllers()

  const offset = 500

  const ship: SpaceObject = createSpaceObject()
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  ship.mass = 0.1
  ship.angleDegree = -120
  ship.health = 250
  ship.steeringPower = 0.55
  ship.enginePower = 0.025
  ship.name = `P-${rndi(0, 900000)}`
  ship.color = randomAnyColor()
  ship.photonColor = '#f0f'
  ship.isLocal = true
  ship.WelcomeMenu = true
  console.log('Your ship name is: ' + ship.name + '\nAnd your color is: ' + ship.color)

  if (getMenu(ship.WelcomeMenu) === 'Startup') {
    console.log('Render Welcome Menu')
    ship.WelcomeMenu = false
    //Can't import Svelte components to Typescript so I cant render it :(
  }

  //if chosen multiplayer
  initMultiplayer()
  ship.ExistingGame = true
  ship.GameTypes.MultiPlayer = true

  //if chosen singleplayer
  // ship.ExistingGame = true
  // ship.GameTypes.SinglePlayer = true

  const lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  const segments: LineSegment[] = []

  const padding = 0
  const pad = { x: padding, y: padding }
  const scr = sub(getScreenRect(ctx), pad)
  segments.push(new LineSegment(pad, { x: scr.x, y: padding }, '#f00'))
  segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, '#00f'))
  segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, '#0f0'))
  segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

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

  const shade = '#000'
  const background = shade

  document.addEventListener('mousemove', (event) => {
    // lightSource.position = getMousePosition(canvas, event)
    // const l = linearTransform(getMousePosition(canvas, event).y, 0, getScreenRect(ctx).y, 0, 100)
    // const hsl = new HSL(shade)
    // hsl.l = l
    // background = hsl.toHex()
    // console.log(background)
  })

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
  all.push(ship)

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
    if (so.name !== ship.name) {
      serverObjects.push(so)
      console.log(`New ship online: ${so.name}`)
    }
  })

  const renderFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    lightSource.position = ship.position
    lightSource.direction = direction(ship.angleDegree)

    const viewSlices = lightSource.shine(segments, ctx)
    const viewTopLeft = { x: 2500, y: 100 }
    const viewSize = { x: 25 * viewSlices.length, y: 15 * viewSlices.length }
    const viewSlizeWidth = Math.floor(viewSize.x / viewSlices.length)
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < viewSlices.length; i++) {
      const roofFloorPad = 150
      const c = linearTransform(viewSlices[i].height, 0, getScreenRect(ctx).x + 250, 255, 2)
      const h = linearTransform(viewSlices[i].height, 0, getScreenRect(ctx).x, viewSize.y - roofFloorPad, roofFloorPad)
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
    // lightSource.render(ctx)

    for (const segs of segments) {
      segs.render(ctx)
    }

    serverObjects.forEach((so) => {
      if (so.shape === SpaceShape.Moon) {
        renderMoon(so, ctx)
      } else {
        renderShip(so, ctx)
      }
    })

    renderSpaceObjectStatusBar(serverObjects, ship, ctx)
    // renderVector(ship.acceleration, ship.position, ctx, 400)
    // renderVector(ship.velocity, ship.position, ctx, 10)
    bodies.forEach((body) => {
      renderMoon(body, ctx)
    })

    fpsCounter(dt, getSerVer(), ctx)
    renderOGShip(ship, ctx, true)
  }

  const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    spaceObjectKeyController(ship, dt)
    friction(ship)
    // wrapSpaceObject(ship, getScreenRect(ctx))
    bounceSpaceObject(ship, getScreenRect(ctx), 0.4, 0, 0)

    bodies.forEach((body) => {
      bodies.forEach((other) => {
        if (body !== other) {
          gravity(body, other)
        }
      })

      gravity(body, ship)

      ship.shotsInFlight.forEach((shot) => {
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

  function renderLoop(
    ctx: CanvasRenderingContext2D,
    renderFrame: (ctx: CanvasRenderingContext2D, dt: number) => void,
    nextFrame: (ctx: CanvasRenderingContext2D, dt: number) => void
  ) {
    function update(timestamp: number): void {
      const dt: number = getFrameTimeMs(timestamp)
      clearScreen(ctx, background)
      renderFrame(ctx, dt)
      updateSpaceObject(ship, dt, ctx)
      updateSpaceObjects(bodies, dt, ctx)
      playerShip = ship
      //Possible optimization send every other frame
      if (isConnectedToWsServer()) {
        ship.photonColor = '#f00'
        sendSpaceObjectToBroadcastServer(ship)
        ship.photonColor = '#f0f'
      }
      // bodies.forEach((b: SpaceObject) => {
      //   sendSpaceObjectToBroadcastServer(b)
      // })

      requestAnimationFrame(update)
      nextFrame(ctx, dt)
    }

    update(0)
  }

  renderLoop(ctx, renderFrame, nextFrame)
}

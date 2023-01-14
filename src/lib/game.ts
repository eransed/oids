import { SpaceShape, type SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { bounceSpaceObject, wrapSpaceObject } from './mechanics'
import { clearScreen, loadingText, renderMoon, renderOGShip, renderPoint, renderShip, renderSpaceObjectStatusBar } from './render'
import { createSpaceObject, getMousePosition, getScreenCenterPosition, getScreenRect, setCanvasSize } from './utils'
import { friction, gravity, handleCollisions, updateSpaceObject, updateSpaceObjects } from './physics'
import { add, rndfVec2d, rndi, sub } from './math'
import { randomAnyColor } from './color'
import { fpsCounter, getFrameTimeMs } from './time'
import { test } from './test'
import { getSerVer, initMultiplayer, isConnectedToWsServer, registerServerUpdate, sendSpaceObjectToBroadcastServer } from './multiplayer'
import { LightSource, LineSegment, Ray } from './shapes'

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  return canvas.getContext("2d")
}

export async function game(canvas: HTMLCanvasElement) {
  if (!test()) {
    return
  }

  console.log('Starting oids...')

  const ctx = <CanvasRenderingContext2D> getContext(canvas)

  //Needs to be a default canvas size so people get the same game size.
  setCanvasSize(ctx)
  loadingText('Loading...', ctx)
  initKeyControllers()

  initMultiplayer()
  // await initMultiplayer()

  const offset = 500

  const ship: SpaceObject = createSpaceObject()
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  ship.mass = 0.1
  ship.angleDegree = -120
  ship.health = 250
  ship.name = `P-${rndi(0, 900000)}`
  ship.color = randomAnyColor()
  ship.photonColor = '#f0f'
  ship.isLocal = true
  console.log('Your ship name is: ' + ship.name + '\nAnd your color is: ' + ship.color)

  const lightSource = new LightSource({x: 1000, y:750}, {x:1, y:0}, 45)
  const segments: LineSegment[] = []
  
  const padding = 500
  const pad = {x: padding, y: padding}
  const scr = sub(getScreenRect(ctx), pad)
  segments.push(new LineSegment(pad, {x: scr.x, y: padding}))
  segments.push(new LineSegment({x: scr.x, y: padding}, {x: scr.x, y: scr.y}))
  segments.push(new LineSegment({x: scr.x, y: scr.y}, {x: padding, y: scr.y}))
  segments.push(new LineSegment({x: padding, y: scr.y}, {x: padding, y: padding}))
  
  segments.push(new LineSegment({x: 2000, y:500}, {x: 2000, y: 1000}))
  segments.push(new LineSegment({x: 2100, y:550}, {x: 2300, y: 1200}))
  segments.push(new LineSegment({x: 700, y:600}, {x: 1000, y: 1000}))
  segments.push(new LineSegment({x: 200, y:700}, {x: 1400, y: 700}))

  document.addEventListener('mousemove', (event) => {
    lightSource.position = getMousePosition(canvas, event)
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

    // const inter = ray.cast(ls)
    // if (inter) {
    //   renderPoint(ctx, inter, '#fff', 20)
    // }
    // ray.render(ctx, 100)

    lightSource.shine(segments, ctx)
    // lightSource.render(ctx)

    for (const segs of segments) {
      segs.render(ctx)
    }
    
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
      clearScreen(ctx)
      renderFrame(ctx, dt)
      updateSpaceObject(ship, dt, ctx)
      updateSpaceObjects(bodies, dt, ctx)

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

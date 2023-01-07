import { SpaceShape, type SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { wrapSpaceObject } from './mechanics'
import { clearScreen, loadingText, renderMoon, renderShip, renderSpaceObjectStatusBar } from './render'
import { createSpaceObject, getScreenCenterPosition, getScreenRect, setCanvasSize } from './utils'
import { friction, gravity, handleCollisions, updateSpaceObject, updateSpaceObjects } from './physics'
import { add, rndfVec2d, rndi } from './math'
import { randomAnyColor, randomBlue } from './color'
import { fpsCounter, getFrameTimeMs } from './time'
import { test } from './test'
import { getSerVer, initMultiplayer, registerServerUpdate, sendSpaceObjectToBroadcastServer, sendToServer } from './multiplayer'

export async function game(ctx: CanvasRenderingContext2D) {

  if (!test()) {
    return
  }
  
  console.log('Starting oids...')
  setCanvasSize(ctx)
  loadingText('Loading...', ctx)
  initKeyControllers()

  await initMultiplayer()

  const offset = 500

  const ship: SpaceObject = createSpaceObject()
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  ship.mass = 0.1
  ship.angleDegree = -120
  ship.health = 250
  ship.name = `P-${rndi(0, 900000)}`
  ship.color = randomAnyColor()
  ship.isLocal = true
  console.log('Your ship name is: ' + ship.name + '\nAnd your color is: ' + ship.color)

  sendToServer(ship)

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

    renderShip(ship, ctx, true)

  }

  const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
    spaceObjectKeyController(ship, dt)
    friction(ship)
    wrapSpaceObject(ship, getScreenRect(ctx))

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
      wrapSpaceObject(body, getScreenRect(ctx))
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
      sendSpaceObjectToBroadcastServer(ship)
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

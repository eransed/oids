import type { SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { fire, handleHittingShot, wrapSpaceObject } from './mechanics'
import { clearScreen, renderFrameInfo, renderMoon, renderShip, renderSpaceObjectStatusBar, renderVector } from './render'
import { createSpaceObject, getScreenCenterPosition, getScreenRect, setCanvasSize } from './utils'
import { friction, gravity, handleCollisions, updateSpaceObject, updateSpaceObjects } from './physics'
import { add, rndfVec2d, rndi, round2dec } from './math'
import { randomAnyColor, randomBlue, randomColor, randomGreen } from './color'
import { fpsCounter, getFrameTimeMs } from './time'
import { test } from './test'
import { initMultiplayer, registerServerUpdate, sendToServer } from './multiplayer'

export async function game(ctx: CanvasRenderingContext2D) {
  if (!test()) {
    return
  }

  console.log('Starting oids...')
  await initMultiplayer()
  setCanvasSize(ctx)
  initKeyControllers()

  const offset: number = 500

  const ship: SpaceObject = createSpaceObject()
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  ship.mass = 0.1
  ship.angleDegree = -120
  ship.health = 250
  ship.name = 'player' + rndi(0, 100000)
  ship.color = randomAnyColor()
  console.log('Your ship name is: ' + ship.name + ' And your color is: #' + randomColor)

  sendToServer(ship)
  // ship.steeringPower = 0.04
  // for (let i = 0; i < 10; i++) {
  //   fire(ship)
  // }

  const bodies: SpaceObject[] = []

  // for (let n = 0; n < 3; n++) {
  //   const s = createSpaceObject()
  //   s.color = randomGreen()
  //   s.mass = 5
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
        serverObjects[i] = so
        return
      }
    }
    if (so.name !== ship.name) serverObjects.push(so)
  })

  const renderFrame = (ctx: CanvasRenderingContext2D): void => {
    renderShip(ship, ctx)

    serverObjects.forEach((so) => {
      renderShip(so, ctx)
    })

    renderSpaceObjectStatusBar(serverObjects, ship, ctx)
    // renderVector(ship.acceleration, ship.position, ctx, 400)
    // renderVector(ship.velocity, ship.position, ctx, 10)
    bodies.forEach((body) => {
      renderMoon(body, ctx)
    })
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

    const currentSpaceObjects = all.concat(serverObjects)

    handleCollisions(currentSpaceObjects, ctx)
  }

  function renderLoop(
    ctx: CanvasRenderingContext2D,
    renderFrame: (ctx: CanvasRenderingContext2D) => void,
    nextFrame: (ctx: CanvasRenderingContext2D, dt: number) => void
  ) {
    function update(timestamp: number): void {
      const dt: number = getFrameTimeMs(timestamp)
      clearScreen(ctx)
      renderFrame(ctx)
      updateSpaceObject(ship, dt, ctx)
      updateSpaceObjects(bodies, dt, ctx)

      //Possible optimization send every other frame
      sendToServer(ship)
      fpsCounter(dt, ctx)
      requestAnimationFrame(update)
      nextFrame(ctx, dt)
    }

    update(0)
  }

  renderLoop(ctx, renderFrame, nextFrame)
}

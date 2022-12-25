import type { SpaceObject } from "./types"

import { initKeyControllers, spaceObjectKeyController } from "./input"
import { fire, wrapSpaceObject } from "./mechanics"
import { clearScreen, renderMoon, renderShip, renderVector } from "./render"
import { createSpaceObject, getScreenCenterPosition, getScreenRect, setCanvasSize } from "./utils"
import { friction, gravity, updateSpaceObject, updateSpaceObjects } from "./physics"
import { add, rndfVec2d } from "./math"
import { randomBlue } from "./color"

export function oids_game(ctx: CanvasRenderingContext2D) {

  console.log('Starting oids...')
  setCanvasSize(ctx)
  initKeyControllers()
  
  const offset: number = 600

  const ship: SpaceObject = createSpaceObject()
  const moon: SpaceObject = createSpaceObject()
  const star: SpaceObject = createSpaceObject()
  const planet: SpaceObject = createSpaceObject()

  const bodies: SpaceObject[] = []
  bodies.push(moon)
  // bodies.push(star)
  // bodies.push(planet)
  for (let n = 0; n < 2; n++) {
    const s = createSpaceObject()
    s.color = randomBlue()
    s.mass = 4
    s.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
    bodies.push(s)
  }

  moon.color = '#ffa'
  ship.color = '#afa'
  planet.color = '#f88'
  star.color = '#fff'

  // star.frictionFactor = 0.1
  // moon.frictionFactor = 0.01

  ship.mass = 0.2
  moon.mass = 4
  planet.mass = 4
  star.mass = 4


  moon.position = add(getScreenCenterPosition(ctx), rndfVec2d(-50, 50))
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  star.position = add(getScreenCenterPosition(ctx), rndfVec2d(-20, 20))
  planet.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))


  const renderFrame = (ctx: CanvasRenderingContext2D): void => {
    renderShip(ship, ctx)
    // renderMoon(ship, ctx)
    // renderVector(ship.acceleration, ship.position, ctx, 400)
    // renderVector(ship.velocity, ship.position, ctx, 10)
    bodies.forEach((body) => {
      renderMoon(body, ctx)
    })
  }

  const nextFrame = (ctx: CanvasRenderingContext2D): void => {

    spaceObjectKeyController(ship)
    friction(ship)
    wrapSpaceObject(ship, getScreenRect(ctx))

    bodies.forEach((body) => {
      bodies.forEach((other) => {
        if (body !== other) {
          gravity(body, other)
        }
      })
      gravity(body, ship)
      // gravity(ship, body)

      ship.shotsInFlight.forEach((shot) => {
        gravity(body, shot)
      })

      friction(body)
      wrapSpaceObject(body, getScreenRect(ctx))
    })

  }

  let time_ms: number

  function renderLoop(
    ctx: CanvasRenderingContext2D,
    renderFrame: (ctx: CanvasRenderingContext2D) => void,
    nextFrame: (ctx: CanvasRenderingContext2D) => void
  ) {

    function update(time_ms: number): void {
      clearScreen(ctx)
      renderFrame(ctx)
      updateSpaceObject(ship, ctx)
      updateSpaceObjects(bodies, ctx)
      requestAnimationFrame(update)
      nextFrame(ctx)
    }

    update(time_ms)

  }

  ship.angleDegree = -120
  for (let i = 0; i < 10; i++) {fire(ship)}

  renderLoop(ctx, renderFrame, nextFrame)
}


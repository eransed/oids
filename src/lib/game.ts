import type { SpaceObject } from "./types"

import { initKeyControllers, spaceObjectKeyController } from "./input"
import { fire, wrapSpaceObject } from "./mechanics"
import { clearScreen, renderMoon, renderShip, renderVector } from "./render"
import { createSpaceObject, getScreenCenterPosition, getScreenRect, setCanvasSize } from "./utils"
import { friction, gravity, handleCollisions, updateSpaceObject, updateSpaceObjects } from "./physics"
import { add, rndfVec2d } from "./math"
import { randomBlue } from "./color"

export function oids_game(ctx: CanvasRenderingContext2D) {

  console.log('Starting oids...')
  setCanvasSize(ctx)
  initKeyControllers()
  
  const offset: number = 300

  const ship: SpaceObject = createSpaceObject()
  ship.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
  ship.mass = 0.1
  ship.angleDegree = -120
  for (let i = 0; i < 10; i++) {fire(ship)}

  const bodies: SpaceObject[] = []
  
  
  for (let n = 0; n < 3; n++) {
    const s = createSpaceObject()
    s.color = randomBlue()
    s.mass = 4
    s.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
    bodies.push(s)
  }
  
  let all: SpaceObject[] = []
  all = all.concat(bodies)
  all.push(ship)

  const renderFrame = (ctx: CanvasRenderingContext2D): void => {
    renderShip(ship, ctx)
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

      ship.shotsInFlight.forEach((shot) => {
        gravity(body, shot)
      })

      friction(body)
      wrapSpaceObject(body, getScreenRect(ctx))
    })

    handleCollisions(all, ctx)

  }

  let time_ms: number

  function renderLoop (
    ctx: CanvasRenderingContext2D,
    renderFrame: (ctx: CanvasRenderingContext2D) => void,
    nextFrame: (ctx: CanvasRenderingContext2D) => void
  ) {

    function update (time_ms: number): void {
      clearScreen(ctx)
      renderFrame(ctx)
      updateSpaceObject(ship, ctx)
      updateSpaceObjects(bodies, ctx)
      requestAnimationFrame(update)
      nextFrame(ctx)
    }

    update(time_ms)

  }


  renderLoop(ctx, renderFrame, nextFrame)
}


import type { SpaceObject } from "./types"

import { frictionFactor } from "./constants"
import { initKeyControllers, spaceObjectKeyController } from "./input"
import { wrapSpaceObject } from "./mechanics"
import { clearScreen, renderMoon, renderShip } from "./render"
import { createSpaceObject, getScreenCenterPosition, getScreenRect, setCanvasSize } from "./utils"
import { friction, gravity, updateSpaceObject } from "./physics"
import { add } from "./math"

export function oids_game(ctx: CanvasRenderingContext2D) {

  console.log('Starting oids...')
  setCanvasSize(ctx)
  initKeyControllers()

  const ship: SpaceObject = createSpaceObject()
  const moon: SpaceObject = createSpaceObject()

  ship.position = add(getScreenCenterPosition(ctx), {x: 70, y: 70})
  moon.position = getScreenCenterPosition(ctx)

  const renderFrame = (ctx: CanvasRenderingContext2D): void => {
    renderShip(ship, ctx)
    renderMoon(moon, ctx)
  }

  const nextFrame = (ctx: CanvasRenderingContext2D): void => {
    spaceObjectKeyController(ship)
    
    // gravity(moon, ship)
    friction(ship, frictionFactor)
    wrapSpaceObject(ship, getScreenRect(ctx))

    updateSpaceObject(ship)
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
      requestAnimationFrame(update)
      nextFrame(ctx)
    }

    update(time_ms)

  }

  renderLoop(ctx, renderFrame, nextFrame)
}


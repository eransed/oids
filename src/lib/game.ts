import type { SpaceObject } from "./types"

import { frictionFactor } from "./constants"
import { initKeyControllers, spaceObjectKeyController } from "./input"
import { friction, wrapSpaceObject } from "./mechanics"
import { clearScreen, drawShip, updateSpaceObject } from "./render"
import { createSpaceObject, getScreenRect, setCanvasSize } from "./utils"

export function oids_game(ctx: CanvasRenderingContext2D) {

    console.log ('Starting oids...')

    setCanvasSize(ctx)

    const ship: SpaceObject = createSpaceObject(ctx)

    initKeyControllers()

    const renderFrame = (ctx: CanvasRenderingContext2D): void => {
        drawShip(ship, ctx)
    }

    const nextFrame = (ctx: CanvasRenderingContext2D): void => {
        wrapSpaceObject(ship, getScreenRect(ctx))
        spaceObjectKeyController(ship)
        updateSpaceObject(ship)
        friction(ship, frictionFactor)
    }

    let time_ms: number

    function renderLoop(
        ctx: CanvasRenderingContext2D, 
        renderFrame: (ctx: CanvasRenderingContext2D) => void, 
        nextFrame: (ctx: CanvasRenderingContext2D) => void
    ){
    
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


import { SpaceObject } from "../interface"


export function renderCharacter(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
    const p = so.characterGlobalPosition // Where should we land?
    ctx.rect(p.x, p.y, 100, 100)
}


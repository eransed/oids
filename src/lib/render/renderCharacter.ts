import type { SpaceObject } from "../interface"
import { groundLevel } from "../physics/physics"

export function renderCharacter(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, groundLevel, so.viewport.x, 100)

  const h = 100
  ctx.fillRect(so.characterGlobalPosition.x, so.characterGlobalPosition.y - h, 50, h)


  ctx.restore()
}

import type { Vec2 } from 'mathil'
import type { NonPlayerCharacter, SpaceObject } from '../interface'
import { setScaledFont } from './render2d'

// export function renderMoon(s: NonPlayerCharacter, ctx: CanvasRenderingContext2D, renderPos: Vec2 | null = null): void {
//   ctx.save()
//   if (!renderPos) {
//     ctx.translate(s.position.x, s.position.y)
//   } else {
//     ctx.translate(renderPos.x, renderPos.y)
//   }

//   const radius = Math.sqrt(s.size.x ** 2 + s.size.y ** 2)

//   ctx.beginPath()
//   ctx.fillStyle = s.color
//   ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
//   ctx.closePath()
//   ctx.fill()
//   setScaledFont(ctx)
//   ctx.fillStyle = '#ccc'
//   //ctx.fillText(`${s.health}hp`, 0, 0)
//   ctx.restore()
// }

export function renderComet(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(s.position.x, s.position.y)
  ctx.beginPath()
  ctx.fillStyle = s.color
  ctx.ellipse(0, 0, s.size.x, s.size.y, 0, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
  setScaledFont(ctx)
  ctx.fillStyle = '#ccc'
  //ctx.fillText(`${s.health}hp`, 0, 0)
  ctx.restore()
}

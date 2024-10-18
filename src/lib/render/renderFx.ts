import { explosionDuration } from '../constants'
import { add2, rndi, degToRad, type Vec2 } from 'mathil'
import type { SpaceObject } from '../interface'

export function renderHitExplosion(pos: Vec2, ctx: CanvasRenderingContext2D) {
  const offset = 20
  const minSize = 1
  const maxSize = 30
  ctx.save()
  ctx.translate(pos.x, pos.y)
  for (const c of ['#ff0', '#f00', '#ee0', '#e00', '#dd0', '#d00', '#008', '#000', '#444', '#fee', '#f66,', '#f99', '#fbb']) {
    const center = add2({ x: 0, y: 0 }, { x: rndi(-offset, offset), y: rndi(-offset, offset) })
    const size = add2({ x: 0, y: 0 }, { x: rndi(minSize, maxSize), y: rndi(minSize, maxSize) })
    ctx.fillStyle = c
    ctx.fillRect(center.x, center.y, size.x, size.y)
  }
  ctx.restore()
}

export function renderExplosionFrame(so: SpaceObject, ctx: CanvasRenderingContext2D, pos: Vec2 | null = null) {
  const offset = 80
  const minSize = 1
  const maxSize = 36 * so.deadFrameCount * 0.03
  ctx.save()
  if (pos !== null) {
    ctx.translate(pos.x - so.size.x / 2, pos.y - so.size.y / 2)
  } else {
    ctx.translate(so.viewFramePosition.x - so.size.x / 2, so.viewFramePosition.y - so.size.y / 2)
  }
  const colors = ['#ff0', '#f00', '#ee0', '#e00', '#dd0', '#d00', '#008', '#000', '#444', '#fee', '#f66,', '#f99', '#fbb']

  if (so.deadFrameCount < explosionDuration * 1) {
    for (const c of colors) {
      const center = add2({ x: 0, y: 0 }, { x: rndi(-offset, offset), y: rndi(-offset, offset) })
      const size = add2({ x: 0, y: 0 }, { x: rndi(minSize, maxSize), y: rndi(minSize, maxSize) })
      ctx.fillStyle = c
      ctx.fillRect(center.x, center.y, size.x, size.y)
    }
  }
  for (let i = 2; i < 3; i += 0.7) {
    ctx.beginPath()

    ctx.arc(0, 0, so.deadFrameCount * i * i * i, 0, degToRad(360))

    ctx.closePath()
    ctx.strokeStyle = '#fff'
    // ctx.lineWidth = (100 / Math.sqrt(so.deadFrameCount ?? 1)) * 2
    ctx.lineWidth = (explosionDuration - so.deadFrameCount) / i
    // ctx.lineWidth = so.deadFrameCount + 10
    ctx.stroke()
  }

  ctx.restore()
}

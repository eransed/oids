import type { Vec2d } from "../types"
import { linearTransform } from "../math"
import { getScreenRect } from "../canvas_util"
import type { Game } from "../game"
import { LineSegment } from "../shapes"

const render3DFrame = (game: Game) => {
  const scr = getScreenRect(game.ctx)
  const padding = 0
  const pad: Vec2d = { x: padding, y: padding }
  game.segments.push(new LineSegment(pad, { x: scr.x, y: padding }, "#f00"))
  game.segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, "#00f"))
  game.segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, "#0f0"))
  game.segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

  const viewSlices = game.lightSource.shine(game.segments, game.ctx)
  const viewTopLeft = { x: getScreenRect(game.ctx).x - 1200, y: 100 }
  const viewSize = { x: 25 * viewSlices.length, y: 15 * viewSlices.length }
  const viewSlizeWidth = Math.floor(viewSize.x / viewSlices.length)
  game.ctx.save()

  game.ctx.fillStyle = "#000"
  game.ctx.fillRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
  game.ctx.fill()

  game.ctx.beginPath()
  for (let i = 0; i < viewSlices.length; i++) {
    const roofFloorPad = 150
    const c = linearTransform(viewSlices[i].distance, 0, getScreenRect(game.ctx).x + 250, 255, 2)
    const h = linearTransform(viewSlices[i].distance, 0, getScreenRect(game.ctx).x, viewSize.y - roofFloorPad, roofFloorPad)
    const y = viewTopLeft.y + (viewSize.y - h) / 2
    game.ctx.fillStyle = viewSlices[i].color
    game.ctx.fillRect(viewTopLeft.x + viewSlizeWidth * i, y, viewSlizeWidth, h)
  }
  game.ctx.strokeStyle = "#f00"
  game.ctx.lineWidth = 10
  game.ctx.strokeRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
  game.ctx.stroke()
  game.ctx.fill()
  game.ctx.restore()

  for (const segs of game.segments) {
    segs.render(game.ctx)
  }
}

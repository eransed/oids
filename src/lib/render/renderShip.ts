import type { SpaceObject } from '../interface'
import type { UIStyle } from '../../style/styleInterfaces'

import { add, newVec2, round2dec, to_string2, type Vec2 } from 'mathil'
import { screenScale } from '../constants'
// import * as ship from '../../assets/ship.svg'
import { renderShot, setScaledFont } from './render2d'
import { renderVec2 } from './renderUI'
import { svg_element } from 'svelte/internal'
import { getShipBundleCache, ShipBundles } from '../../style/ships'

export function renderShip(so: SpaceObject, ctx: CanvasRenderingContext2D, renderAsLocalPlayer = false, style: UIStyle, renderPos: Vec2 | null = null): void {
  const scale = setScaledFont(ctx)
  const shipSize: Vec2 = { x: 60, y: 100 }
  so.size = shipSize

  // Render hit box of ship after contex restore
  //renderHitRadius(so, ctx)

  ctx.save()
  if (!renderPos) {
    ctx.translate(so.viewFramePosition.x, so.viewFramePosition.y)
    // renderVec2(`world: ${to_string2(so.position)}`, so.viewFramePosition, ctx)
  } else {
    ctx.translate(renderPos.x, renderPos.y)
    // renderVec2(`world: ${to_string2(renderPos)}`, renderPos, ctx)
  }
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
  ctx.lineWidth = 3 * screenScale

  // Hull (Original hull)
  // ctx.strokeStyle = so.colliding ? '#f00' : so.color
  // ctx.fillStyle = so.colliding ? '#f00' : so.color
  // ctx.beginPath()
  // ctx.moveTo(0, (-shipSize.y / 3) * scale)
  // ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  // ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  // ctx.lineTo(0, (-shipSize.y / 3) * scale)

  // ctx.closePath()

  // Draw ship image
  ctx.drawImage(getShipBundleCache(so.shipVariant).img, -75, -75, 150, 150)
  // ctx.stroke()

  ctx.fillStyle = '#f00'
  ctx.rotate((20 * Math.PI) / 180)
  if (!so.online && !renderAsLocalPlayer) {
    ctx.fillText(so.name, (-1.2 * so.size.x) / 2, -30)
    ctx.fillText('offline', (-1.2 * so.size.x) / 2, 30)
  }

  // Restore drawing
  ctx.restore()

  // Draw shots
  renderShot(so, ctx, style)
}

export function renderShip_(so: SpaceObject, ctx: CanvasRenderingContext2D, renderAsLocalPlayer = false, style: UIStyle, renderPos: Vec2 | null = null): void {
  const scale = setScaledFont(ctx)
  const shipSize: Vec2 = { x: 60, y: 100 }
  so.size = shipSize

  // Render hit box of ship after contex restore
  //renderHitRadius(so, ctx)

  ctx.save()
  if (!renderPos) {
    ctx.translate(so.viewFramePosition.x, so.viewFramePosition.y)
    // renderVec2(`world: ${to_string2(so.position)}`, so.viewFramePosition, ctx)
  } else {
    ctx.translate(renderPos.x, renderPos.y)
    // renderVec2(`world: ${to_string2(renderPos)}`, renderPos, ctx)
  }
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
  ctx.lineWidth = 3 * screenScale

  ctx.strokeStyle = so.colliding ? '#f00' : so.color
  ctx.fillStyle = so.colliding ? '#f00' : so.color
  ctx.beginPath()
  ctx.moveTo(0, (-shipSize.y / 3) * scale)
  ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo(0, (-shipSize.y / 3) * scale)

  ctx.closePath()
  ctx.stroke()

  ctx.fillStyle = '#f00'
  ctx.rotate((20 * Math.PI) / 180)
  if (!so.online && !renderAsLocalPlayer) {
    ctx.fillText(so.name, (-1.2 * so.size.x) / 2, -30)
    ctx.fillText('offline', (-1.2 * so.size.x) / 2, 30)
  }

  // Restore drawing
  ctx.restore()

  // Draw shots
  renderShot(so, ctx, style)
}

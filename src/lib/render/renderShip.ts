import type { SpaceObject } from '../interface'
import type { UIStyle } from '../interface'

import { direction2, newVec2, round2dec, smul2, sub2, type Vec2 } from 'mathil'
import { screenScale } from '../constants'
// import * as ship from '../../assets/ship.svg'
import { renderShot, renderVector, setScaledFont } from './render2d'
import { getShipBundleCache, ShipVariant } from '../../style/ships'
import { getWorldCoordinates } from '../physics/physics'

export function renderShip(
  so: SpaceObject,
  ctx: CanvasRenderingContext2D,
  renderAsLocalPlayer = false,
  style: UIStyle,
  renderPos: Vec2 | null = null,
  showVectors = false
): void {
  const scale = setScaledFont(ctx)
  const shipSize: Vec2 = { x: 60, y: 100 }
  so.size = shipSize

  // Render hit box of ship after contex restore
  //renderHitRadius(so, ctx)

  let shipTranslation = newVec2()

  ctx.save()
  if (!renderPos) {
    ctx.translate(so.viewFramePosition.x, so.viewFramePosition.y)
    shipTranslation = so.viewFramePosition
    // renderVec2(`world: ${to_string2(so.position)}`, so.viewFramePosition, ctx)
  } else {
    ctx.translate(renderPos.x, renderPos.y)
    shipTranslation = renderPos
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
  if (so.ship) {
    ctx.drawImage(
      getShipBundleCache(so.ship.shipVariant).img,
      -75,
      -75,
      150,
      150
    )
  } else {
    ctx.drawImage(getShipBundleCache(0).img, -75, -75, 150, 150)
  }
  // ctx.stroke()

  ctx.fillStyle = '#f00'
  if (!so.online && !renderAsLocalPlayer) {
    ctx.fillText(so.name, (-1.2 * so.size.x) / 2, -30)
    ctx.fillText('offline', (-1.2 * so.size.x) / 2, 30)
  }

  ctx.fillStyle = '#fa0'
  if (so.afterBurner) {
    if(so.ship.shipVariant === ShipVariant.Retro){
      ctx.fillRect(-50, 70, 10, 40)
      ctx.fillRect(43, 70, 10, 40)
    }
  }

  // Restore drawing
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#fa0'


  so.positionalTrace.push(so.viewFramePosition)

  if (so.positionalTrace.length > 120) {
    so.positionalTrace.shift()
  }

  if (so.afterBurner) {
    
    for (let i = so.positionalTrace.length - 1; i > -1; i--) {
    // for (let i = 0; i < so.positionalTrace.length; i++) {
      const t = sub2(so.positionalTrace[i], shipTranslation)
      const pos = so.positionalTrace[i]
      ctx.translate(t.x, t.y)
      ctx.fillRect(pos.x, pos.y, 20, 20)
    }

  }

    
  // Restore drawing
  ctx.restore()


  if (showVectors) {
    // Render vectors
    renderVector(smul2(so.velocity, 1.6), so.viewFramePosition, ctx, 50, '#fa3')
    renderVector(
      smul2(direction2(so.angleDegree), 10),
      so.viewFramePosition,
      ctx,
      50,
      '#fff'
    )
  }


  // Draw shots
  renderShot(so, ctx, style)
}



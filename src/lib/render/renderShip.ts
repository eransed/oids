import type { SpaceObject } from '../interface'
import { round2dec, type Vec2d } from 'mathil'
import { screenScale } from '../constants'
// import * as ship from '../../assets/ship.svg'
import { renderShot, setScaledFont } from './render2d'

export function renderShip(so: SpaceObject, ctx: CanvasRenderingContext2D, renderAsLocalPlayer = false): void {
 const scale = setScaledFont(ctx)
 const shipSize: Vec2d = { x: 60, y: 100 }
 so.size = shipSize

 const shipSvg = new Image()

//  shipSvg.src = ship.default

 // Render hit box of ship after contex restore
 //renderHitRadius(so, ctx)

 ctx.save()
 ctx.translate(so.position.x, so.position.y)
 ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
 ctx.lineWidth = 3 * screenScale

 // Hull
 ctx.strokeStyle = so.colliding ? '#f00' : so.color
 ctx.fillStyle = so.colliding ? '#f00' : so.color
 ctx.beginPath()
 ctx.moveTo(0, (-shipSize.y / 3) * scale)
 ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
 ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
 ctx.lineTo(0, (-shipSize.y / 3) * scale)

 ctx.closePath()

 if (renderAsLocalPlayer) {
  // ctx.filter = "hue-rotate(250deg)"
  // ctx.drawImage(shipSvg, -75, -75, 150, 150)
  ctx.stroke()
 } else {
  // ctx.filter = "hue-rotate(360deg)"
  // ctx.drawImage(shipSvg, -75, -75, 150, 150)
  ctx.fill()
 }

 ctx.fillStyle = '#f00'
 ctx.rotate((20 * Math.PI) / 180)
 if (!so.online && !renderAsLocalPlayer) {
  ctx.fillText(so.name, (-1.2 * so.size.x) / 2, -30)
  ctx.fillText('offline', (-1.2 * so.size.x) / 2, 30)
 }

 // Restore drawing
 ctx.restore()

 // Draw shots
 renderShot(so, ctx)
}

import type { SpaceObject } from "./types"
import { add, round2dec } from "./math"

export function drawShip(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  let scale: number = 2
  let shipSize = { x: 40, y: 80 }
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.strokeStyle = so.color
  ctx.lineWidth = 5
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)

  // hull
  ctx.strokeStyle = so.colliding ? "#f00" : so.color
  ctx.fillStyle = so.colliding ? "#f00" : so.color
  ctx.moveTo(0, (-shipSize.y / 2) * scale)
  ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo(0, (-shipSize.y / 2) * scale)

  // canons
  const cannonWidth: number = 10
  const cannonStart: number = 15
  const cannonEnd: number = 40
  ctx.moveTo(cannonWidth, cannonStart)
  ctx.lineTo(cannonWidth, -cannonEnd)
  ctx.moveTo(-cannonWidth, cannonStart)
  ctx.lineTo(-cannonWidth, -cannonEnd)
  ctx.stroke()

  // tower
  ctx.beginPath()
  ctx.arc(0, 20, 16, 0, Math.PI * 2)
  ctx.fill()

  //Restore drawing
  ctx.restore()
}

export const updateSpaceObject = (so: SpaceObject) => {
  add(so.position, so.velocity)
  add(so.velocity, so.acceleration)
}

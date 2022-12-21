import type { SpaceObject, Vec2d } from "./types"
import { add, round2dec } from "./math"
import { canvasBackgroundColor } from "./constants"

export function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = canvasBackgroundColor
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}


export function drawVector(
  v: Vec2d,
  origin: Vec2d,
  ctx: CanvasRenderingContext2D,
  color: string = '#fff',
  scale: number = 1,
  offset: Vec2d = { x: 0, y: 0 }
) {
  ctx.save()
  ctx.translate(origin.x + offset.x, origin.y + offset.y)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 5
  ctx.moveTo(0, 0)
  ctx.lineTo(scale * v.x, scale * v.y)
  ctx.stroke()
  ctx.restore()
}

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

export function drawShot(so: SpaceObject, ctx: any) {
  for (let shot of so.shotsInFlight) {
    if (shot.didHit) continue
    if (Math.random() > 0.99) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#00f" : "#fff"
    } else if (Math.random() > 0.985) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#ff0" : "#fff"
    } else if (Math.random() > 0.975) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#f00" : "#fff"
    } else {
      ctx.fillStyle = shot.armedDelay < 0 ? shot.color : "#fff"
    }
    ctx.save()
    ctx.translate(shot.position.x, shot.position.y)
    ctx.rotate(((90 + shot.angleDegree) * Math.PI) / 180)
    ctx.fillRect(-shot.size.x / 2, -shot.size.y / 2, shot.size.x, shot.size.y)
    // ctx.beginPath()
    // ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    // ctx.fill()
    ctx.restore()
  }
}

export function drawMoon(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  
}

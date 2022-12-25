import type { SpaceObject, Vec2d } from "./types"
import { round2dec, scalarMultiply } from "./math"
import { canvasBackgroundColor } from "./constants"
import { to_string } from "./utils"

export function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = canvasBackgroundColor
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}


export function renderVector(
  v: Vec2d,
  origin: Vec2d,
  ctx: CanvasRenderingContext2D,
  scale: number = 10000,
  color: string = '#fff',
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

export function renderShip(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  let scale: number = 2
  let shipSize = { x: 40, y: 80 }
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.strokeStyle = so.color
  ctx.lineWidth = 5
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)

  // Hull
  ctx.strokeStyle = so.colliding ? "#f00" : so.color
  ctx.fillStyle = so.colliding ? "#f00" : so.color
  ctx.moveTo(0, (-shipSize.y / 2) * scale)
  ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo(0, (-shipSize.y / 2) * scale)

  // // Canons
  // const cannonWidth: number = 10
  // const cannonStart: number = 15
  // const cannonEnd: number = 40
  // ctx.moveTo(cannonWidth, cannonStart)
  // ctx.lineTo(cannonWidth, -cannonEnd)
  // ctx.moveTo(-cannonWidth, cannonStart)
  // ctx.lineTo(-cannonWidth, -cannonEnd)
  ctx.stroke()

  // // Tower
  // ctx.beginPath()
  // ctx.arc(0, 20, 16, 0, Math.PI * 2)
  // ctx.fill()

  ctx.font = "30px courier"
  ctx.fillStyle = "#ccc"
  ctx.fillText("SIF: " + so.shotsInFlight.length, 40, -120)
  ctx.fillText('P' + to_string(so.position), 40, -80)
  ctx.fillText('V' + to_string(so.velocity, 2), 40, -40)
  ctx.fillText('A' + to_string(scalarMultiply(so.acceleration, 1), 3), 40, 0)
  ctx.fillText('-', 40, 40)
  ctx.fillText('-', 40, 80)

  // Restore drawing
  ctx.restore()

  // Draw shots
  renderShot(so, ctx)
}

export function renderShot(so: SpaceObject, ctx: any) {
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

export function renderMoon(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(s.position.x, s.position.y)
  ctx.beginPath()
  ctx.fillStyle = s.color
  ctx.arc(0, 0, 20, 0, Math.PI * 2, false)
  ctx.fill();
  ctx.restore()
}

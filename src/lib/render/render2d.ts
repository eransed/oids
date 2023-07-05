import { SpaceShape, type Remote, type SpaceObject } from '../interface'
import { round2dec, type Line, type Vec2d } from 'mathil'
import { screenScale } from '../constants'
import { getScreenRect } from '../canvas_util'
import '../../app.css'
import { renderMoon } from './renderDebris'
import { renderShip } from './renderShip'

export function clearScreen(ctx: CanvasRenderingContext2D, color = '#000') {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function render(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  switch (s.shape) {
    case SpaceShape.Moon:
      renderMoon(s, ctx)
      break
    case SpaceShape.SmallShip:
      renderShip(s, ctx)
      break
    default:
      console.error(`Unknown shape: ${s.shape}`)
  }
}

export function renderInfoText(text: string, ypos: number, ctx: CanvasRenderingContext2D): void {
  const xpos = 26
  setScaledFont(ctx)
  ctx.fillStyle = '#fff'
  ctx.fillText(`${text}`, xpos, ypos)
}

export function loadingText(text: string, ctx: CanvasRenderingContext2D) {
  ctx.font = 'bold 80px courier'
  ctx.fillStyle = '#fff'
  const ppt = 15
  ctx.fillText(text, getScreenRect(ctx).x / 2 - text.length * ppt, getScreenRect(ctx).y / 2)
}

export function getNamesAsString(sos: SpaceObject[], label = ''): string {
  const arr: string[] = []
  sos.forEach((e) => {
    arr.push(`(${e.name}, ${e.health}hp)`)
  })
  return label + arr.join(', ')
}

export function renderVector(v: Vec2d, origin: Vec2d, ctx: CanvasRenderingContext2D, scale = 10000, color = '#fff', offset: Vec2d = { x: 0, y: 0 }) {
  ctx.save()
  ctx.translate(origin.x + offset.x, origin.y + offset.y)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 5
  ctx.moveTo(0, 0)
  ctx.lineTo(scale * v.x, scale * v.y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function renderPoint(ctx: CanvasRenderingContext2D, v: Vec2d, color: string, radius = 10): void {
  ctx.save()
  ctx.translate(v.x, v.y)
  ctx.fillStyle = color
  ctx.lineWidth = 4
  ctx.beginPath()
  // ctx.strokeStyle = color
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function renderLine(ctx: CanvasRenderingContext2D, l: Line, c = '#000', width = 3) {
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = c
  ctx.lineWidth = width
  ctx.moveTo(l.p1.x, l.p1.y)
  ctx.lineTo(l.p2.x, l.p2.y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function renderHitBox(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
  ctx.strokeStyle = '#fff'
  ctx.strokeRect(0, 0, so.size.x, so.size.y)
  ctx.restore()
}

export function renderHitRadius(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.strokeStyle = '#447'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, so.hitRadius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function renderShot(so: SpaceObject, ctx: CanvasRenderingContext2D) {
  ctx.save()
  for (const shot of so.shotsInFlight) {
    if (shot.didHit) continue
    if (Math.random() > 0.99) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#fff' : '#fff'
    } else if (Math.random() > 0.9) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#f0f' : '#fff'
    } else if (Math.random() > 0.8) {
      ctx.fillStyle = shot.armedDelay < 0 ? '#0f0' : '#fff'
    } else {
      ctx.fillStyle = shot.armedDelay < 0 ? shot.color : '#fff'
    }
    ctx.save()
    ctx.translate(shot.position.x, shot.position.y)
    ctx.rotate(((90 + shot.angleDegree) * Math.PI) / 180)
    ctx.fillRect(-shot.size.x / 2, -shot.size.y / 2, shot.size.x, shot.size.y)
    ctx.restore()
  }
  ctx.restore()
}

export function setScaledFont(ctx: CanvasRenderingContext2D): number {
  const scale = screenScale - 1 > 1 ? screenScale - 1 : 1
  ctx.font = `bold ${16 * scale}px courier`
  return scale
}

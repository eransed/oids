import { round2dec, type Vec2 } from 'mathil'
import type { Crater, SpaceObject } from '../interface'
import { renderShot } from './render2d'
import type { UIStyle } from '../../style/styleInterfaces'

export function renderMoon(npc: SpaceObject, pos: Vec2, ctx: CanvasRenderingContext2D, style: UIStyle): void {
  const moon = getMoon(npc.moonType)
  const craterDetails = moon.craters

  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate((round2dec(90 + npc.angleDegree, 1) * Math.PI) / 180)

  ctx.fillText(`${npc.shotsInFlightNew.length}`, 0, 0)

  // Draw main moon circle
  const moonRadius = Math.sqrt(npc.size.x ** 2 + npc.size.y ** 2)
  ctx.beginPath()
  ctx.arc(0, 0, moonRadius, 0, Math.PI * 2)
  ctx.fillStyle = moon.color
  // ctx.fillRect(0, 0, npc.size.x, npc.size.y)
  ctx.fill()
  ctx.closePath()

  // Draw craters
  for (const crater of craterDetails) {
    const scaledX = crater.x * (moonRadius / 150) // Adjust based on the moon's size
    const scaledY = crater.y * (moonRadius / 150) // Adjust based on the moon's size
    drawCrater(ctx, scaledX, scaledY, crater.radius, crater.color)
  }

  // Draw moon details, like mare and terminator
  ctx.beginPath()
  //   ctx.arc(0, 0, moonRadius - 10, 0, Math.PI * 2)
  ctx.shadowBlur = 20
  ctx.shadowColor = '#888888'
  ctx.strokeStyle = moon.color
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.closePath()

  ctx.restore()

  // Draw shots
  renderShot(npc, ctx, style)

  //   // Label the moon
  //   ctx.font = 'bold 20px Arial'
  //   ctx.fillStyle = '#000000'
  //   ctx.fillText(moonName, -40, moonRadius - 30)
}

function drawCrater(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

export function getMoon(type: number) {
  interface Moon {
    craters: Crater[]
    color: string
  }

  const moonList: Moon[] = [
    { craters: earthMoonCraters, color: earthMoonColor },
    { craters: europaCraters, color: europaColor },
    { craters: titanCraters, color: titanColor },
    { craters: tritonCraters, color: tritonColor },
  ]

  return moonList[type]
}

// Earth Moon details
export const earthMoonCraters: Crater[] = [
  { x: -50, y: -30, radius: 30, color: '#888888' },
  { x: 80, y: 40, radius: 25, color: '#888888' },
  { x: -30, y: 80, radius: 20, color: '#888888' },
]

export const earthMoonColor = '#dcdcdc'

// Moon 1 - Europa (Jupiter's moon)
export const europaCraters: Crater[] = [
  { x: -20, y: -10, radius: 15, color: '#888888' },
  { x: 30, y: 40, radius: 12, color: '#888888' },
  { x: -10, y: 50, radius: 10, color: '#888888' },
]
export const europaColor = '#f0f0f0'

// Moon 2 - Titan (Saturn's moon)
export const titanCraters: Crater[] = [
  { x: 30, y: -20, radius: 25, color: '#888888' },
  { x: -50, y: 30, radius: 20, color: '#888888' },
  { x: 20, y: 60, radius: 18, color: '#888888' },
  { x: 10, y: -70, radius: 15, color: '#888888' },
  { x: -80, y: -30, radius: 22, color: '#888888' },
]
export const titanColor = '#b8a98e'

// Moon 3 - Triton (Neptune's moon)
export const tritonCraters: Crater[] = [
  { x: -40, y: 10, radius: 18, color: '#888888' },
  { x: 60, y: 50, radius: 15, color: '#888888' },
  { x: -30, y: -40, radius: 12, color: '#888888' },
  { x: 20, y: -20, radius: 14, color: '#888888' },
  { x: 40, y: -50, radius: 20, color: '#888888' },
]
export const tritonColor = '#c0c0c0'

import { randomAnyLightColor } from '../color'
import type { Damageable } from '../interface'
import { maxElem, newVec2, rndfVec2 } from 'mathil'
import { setScaledFont } from '../render/render2d'
import type { Shape } from './Shape'

export interface Moon extends Shape, Damageable {}

export function newMoon(): Moon {
 const moon: Moon = {
  render: renderMoon,
  mass: 1,
  size: newVec2(),
  velocity: newVec2(),
  acceleration: newVec2(),
  position: newVec2(),
  color: randomAnyLightColor(),
  health: 100,
  isDead: false,
  deadFrameCount: 0,
  obliterated: false,
  angleDegree: 0,
  angularVelocity: 0,
  lastDamagedByName: '',
  killedByName: '',
 }

 // moon.acceleration = rndfVec2(0.001, 0.001)
 moon.position = rndfVec2(100, 1000)
 moon.velocity = rndfVec2(0.1, 10)
 moon.size = rndfVec2(10, 100)

 function renderMoon(ctx: CanvasRenderingContext2D, scale = 1): void {
  ctx.save()
  ctx.translate(moon.position.x, moon.position.y)
  ctx.beginPath()
  ctx.fillStyle = moon.color
  ctx.arc(0, 0, maxElem(moon.size) * scale, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()
  setScaledFont(ctx)
  ctx.fillStyle = '#fff'
  ctx.restore()
 }

 return moon
}

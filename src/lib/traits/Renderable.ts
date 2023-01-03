import type { Positionable, Sizeable } from './Physical'
import type { Damager, Vec2d } from '../types'
import type { Steerable } from './Steerable'
import { steerImpl } from './Steerable'

export interface Renderable extends Positionable, Sizeable {
  color: string
  ctx: CanvasRenderingContext2D
  render(): void
}

// export class RenderableBase implements Positionable, Sizeable, Damager, Steerable {

//   constructor (cc: CanvasRenderingContext2D) {
//     this.ctx = cc
//   }

//   renderMoon(): void {
//     this.ctx.save()
//     this.ctx.translate(this.position.x, this.position.y)
//     this.ctx.beginPath()
//     this.ctx.fillStyle = this.color
//     const radius: number = this.size.x
//     this.ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
//     this.ctx.fill();
//     this.ctx.restore()
//   }

//   renderProgressBar(amount: number, max: number, redLevel: number = 60, w: number = 200, h: number = 20): void {
//     this.ctx.save()
//     this.ctx.translate(this.position.x, this.position.y)
//     const linew: number = 4
//     this.ctx.lineWidth = linew
//     this.ctx.strokeStyle = '#ccc'

//     if (amount > w || amount < redLevel) {
//       this.ctx.fillStyle = '#f00'
//     } else if (redLevel < 0 && amount < Math.abs(redLevel)) {
//       this.ctx.fillStyle = '#0f0'
//     }

//     if (amount < 0) {
//       amount = 0
//     }

//     const p: number = w*amount/max

//     this.ctx.strokeRect(0, 0, w, h)
//     this.ctx.fillStyle = '#f00'
//     this.ctx.fillRect(Math.floor(linew/2), Math.floor(linew/2), p - linew, h - linew)
//     this.ctx.restore()
//   }

// }

export class PhotonMissile implements Renderable, Steerable, Damager {
  position: Vec2d = { x: 0, y: 0 }
  steeringPower: number = 1
  angleDegree: number = 120
  angularVelocity: number = 0
  color: string = '#fff'
  size: Vec2d = { x: 10, y: 10 }
  damage: number = 1
  armedDelay: number = 20
  didHit: boolean = false
  shotBlowFrame: number = 0

  readonly ctx: CanvasRenderingContext2D

  constructor(cc: CanvasRenderingContext2D) {
    this.ctx = cc
  }

  steer(direction: number, deltaTime: number): void {
    steerImpl(this, direction, deltaTime)
  }

  render(): void {
    if (Math.random() > 0.99) {
      this.ctx.fillStyle = this.armedDelay < 0 ? '#00f' : '#fff'
    } else if (Math.random() > 0.985) {
      this.ctx.fillStyle = this.armedDelay < 0 ? '#ff0' : '#fff'
    } else if (Math.random() > 0.975) {
      this.ctx.fillStyle = this.armedDelay < 0 ? '#f00' : '#fff'
    } else {
      this.ctx.fillStyle = this.armedDelay < 0 ? this.color : '#fff'
    }

    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate(((90 + this.angleDegree) * Math.PI) / 180)
    this.ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    this.ctx.restore()
  }
}

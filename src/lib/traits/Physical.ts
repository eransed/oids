import type { Vec2 } from 'mathil'
import { angularFriction, linearFriction, timeScale } from '../constants'
import { sub2, magnitude2, scalarMultiply2, add2, smul2, degToRad, radToDeg, withinBounds2, limitVec2 } from 'mathil'
import type { Testable, TestModule } from './Testable'

export interface Positionable {
  position: Vec2
}

export interface Sizeable {
  size: Vec2
}

export class Physical implements Positionable, Testable {
  mass = 1
  size: Vec2 = { x: 10, y: 10 }
  position: Vec2 = { x: 0, y: 0 }
  velocity: Vec2 = { x: 0, y: 0 }
  acceleration: Vec2 = { x: 0, y: 0 }
  angleDegree = 120
  angularVelocity = 0

  // constructor() {}

  update(deltaTime: number): void {
    if (isNaN(deltaTime)) {
      return
    }
    const dts: number = deltaTime * timeScale
    const v: Vec2 = scalarMultiply2(this.velocity, dts)
    const a: Vec2 = scalarMultiply2(this.acceleration, dts)
    this.velocity = add2(this.velocity, a)
    this.position = add2(this.position, v)
    this.acceleration = { x: 0, y: 0 }
    this.velocity = limitVec2(this.velocity, { x: 100, y: 100 })
    this.angleDegree += this.angularVelocity * dts
  }

  alignHeadingToVelocity(): void {
    this.angleDegree = radToDeg(Math.atan2(this.velocity.y, this.velocity.x))
  }

  onScreen(max: Vec2, min: Vec2 = { x: 0, y: 0 }): boolean {
    return withinBounds2(this.position, max, min)
  }

  getHeading(): Vec2 {
    return {
      x: Math.cos(degToRad(this.angleDegree)),
      y: Math.sin(degToRad(this.angleDegree)),
    }
  }

  applyFriction(): void {
    // const head: Vec2 = getHeading(p)
    // const fric: Vec2 = mul(head, linearFriction)
    this.velocity = smul2(this.velocity, linearFriction.x)
    this.angularVelocity = this.angularVelocity * angularFriction
  }

  gravityAttract(attractee: Physical, G = 1): void {
    const m0: number = this.mass
    const m1: number = attractee.mass
    const v01: Vec2 = sub2(this.position, attractee.position)
    const r: number = magnitude2(v01)
    const r2: number = Math.pow(r, 2)
    const F: number = G * ((m0 * m1) / r2)
    const gvec: Vec2 = scalarMultiply2(v01, F)
    attractee.acceleration = add2(attractee.acceleration, gvec)
  }

  testUpdate(): boolean {
    return true
  }

  testOnScreen(): boolean {
    return true
  }

  getTestModule(): TestModule {
    return {
      name: 'Physical',
      moduleTestFunctions: [
        { desc: 'Test of the Physical.update method', func: this.testUpdate },
        {
          desc: 'Test of the Physical.onScreen method',
          func: this.testOnScreen,
        },
      ],
    }
  }
}

import type { Vec2d } from "mathil"
import { angularFriction, linearFriction, timeScale } from "../constants"
import {
  sub,
  magnitude,
  scalarMultiply,
  add,
  smul,
  degToRad,
  radToDeg,
  withinBounds,
  limitv,
} from "mathil"
import type { Testable, TestFunction, TestModule } from "./Testable"

export interface Positionable {
  position: Vec2d
}

export interface Sizeable {
  size: Vec2d
}

export class Physical implements Positionable, Testable {
  mass = 1
  size: Vec2d = { x: 10, y: 10 }
  position: Vec2d = { x: 0, y: 0 }
  velocity: Vec2d = { x: 0, y: 0 }
  acceleration: Vec2d = { x: 0, y: 0 }
  angleDegree = 120
  angularVelocity = 0

  // constructor() {}

  update(deltaTime: number): void {
    if (isNaN(deltaTime)) {
      return
    }
    const dts: number = deltaTime * timeScale
    const v: Vec2d = scalarMultiply(this.velocity, dts)
    const a: Vec2d = scalarMultiply(this.acceleration, dts)
    this.velocity = add(this.velocity, a)
    this.position = add(this.position, v)
    this.acceleration = { x: 0, y: 0 }
    this.velocity = limitv(this.velocity, { x: 100, y: 100 })
    this.angleDegree += this.angularVelocity * dts
  }

  alignHeadingToVelocity(): void {
    this.angleDegree = radToDeg(Math.atan2(this.velocity.y, this.velocity.x))
  }

  onScreen(max: Vec2d, min: Vec2d = { x: 0, y: 0 }): boolean {
    return withinBounds(this.position, max, min)
  }

  getHeading(): Vec2d {
    return {
      x: Math.cos(degToRad(this.angleDegree)),
      y: Math.sin(degToRad(this.angleDegree)),
    }
  }

  applyFriction(): void {
    // const head: Vec2d = getHeading(p)
    // const fric: Vec2d = mul(head, linearFriction)
    this.velocity = smul(this.velocity, linearFriction.x)
    this.angularVelocity = this.angularVelocity * angularFriction
  }

  gravityAttract(attractee: Physical, G = 1): void {
    const m0: number = this.mass
    const m1: number = attractee.mass
    const v01: Vec2d = sub(this.position, attractee.position)
    const r: number = magnitude(v01)
    const r2: number = Math.pow(r, 2)
    const F: number = G * ((m0 * m1) / r2)
    const gvec: Vec2d = scalarMultiply(v01, F)
    attractee.acceleration = add(attractee.acceleration, gvec)
  }

  testUpdate(): boolean {
    return true
  }

  testOnScreen(): boolean {
    return true
  }

  getTestModule(): TestModule {
    return {
      name: "Physical",
      moduleTestFunctions: [
        { desc: "Test of the Physical.update method", func: this.testUpdate },
        {
          desc: "Test of the Physical.onScreen method",
          func: this.testOnScreen,
        },
      ],
    }
  }
}

import type { Rotatable, Vec2d } from "../types"
import type { Positionable } from "./Physical"

export interface Steerable extends Positionable, Rotatable {
  position: Vec2d
  angleDegree: number
  angularVelocity: number
  steeringPower: number
  steer(direction: number, deltaTime: number): void
}

export function steerImpl(s: Steerable, direction: number, deltaTime: number) {
  s.angleDegree += direction * s.steeringPower * deltaTime
}

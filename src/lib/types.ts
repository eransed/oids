import type { Steerable } from "./traits/Steerable"

export interface Vec2d {
  x: number
  y: number
}

export interface Positionable {
  position: Vec2d
}

export interface Physical extends Positionable {
  mass: number
  size: Vec2d
  velocity: Vec2d
  acceleration: Vec2d
}

export interface Rotatable extends Positionable {
  angleDegree: number
  angularVelocity: number
}

export interface Collidable extends Positionable {
  colliding: boolean
}

// export interface Renderable extends Positionable, Physical, Collidable {
//   color: string
// }

export interface Thrustable extends Positionable, Physical {
  fuel: number
  enginePower: number
}

export interface Fireable extends Positionable, Physical {
  killCount: number
  ammo: number
  missileSpeed: number
  missileDamage: number
  canonCoolDown: number
  canonOverHeat: boolean
  canonHeatAddedPerShot: number
  canonCoolDownSpeed: number
}

export interface Bounceable extends Positionable, Physical {
  bounceCount: number
}

export interface Damager extends Positionable {
  damage: number
  armedDelay: number
  didHit: boolean
  shotBlowFrame: number
}

export interface Damageable extends Positionable {
  health: number
}

export interface SpaceObject extends Positionable, Physical, Thrustable, Steerable, Damager, Damageable, Fireable, Collidable, Bounceable {
  name: string
  color: string
  shotsInFlight: SpaceObject[]
  collidingWith: SpaceObject[]
}

export function applySteer(o: Steerable, deltaTime: number): void {
  o.angleDegree += o.steeringPower
}

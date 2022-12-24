import type { SpaceObject, Vec2d } from "./types"
import { add, degToRad, limitv, magnitude, radToDeg, scalarMultiply, sub, vec2d } from "./math"

export function updateSpaceObject(so: SpaceObject): void {
  so.position = add(so.position, so.velocity)
  so.velocity = add(so.velocity, so.acceleration)
  so.acceleration = {x: 0, y: 0}
  // so.velocity = limitv(so.velocity, {x: 0.1, y: 0.1})
  so.acceleration = limitv(so.acceleration, {x: 0.005, y: 0.005})
}

export function updateSpaceObjects(sos: SpaceObject[]): void {
  sos.forEach((so) => {
    updateSpaceObject(so)
  })
}

export function gravity(from: SpaceObject, to: SpaceObject, G: number = 1): void {
  const m0: number = from.mass
  const m1: number = to.mass
  const v01: Vec2d = sub(from.position, to.position)
  const r: number = magnitude(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2d = scalarMultiply(v01, F * 3)
  to.acceleration = add(to.acceleration, gvec)
  // to.acceleration = gvec
}

export function friction(so: SpaceObject) {
  so.velocity = scalarMultiply(so.velocity, so.frictionFactor)
}

export function applyFriction(so: SpaceObject, friction: number) {
  so.velocity = scalarMultiply(so.velocity, friction)
}

export function heading(so: SpaceObject): Vec2d {
  return {
    x: Math.cos(degToRad(so.angleDegree)),
    y: Math.sin(degToRad(so.angleDegree)),
  }
}

export function headingFromAngle(angleDegree: number): Vec2d {
  return {
    x: Math.cos(degToRad(angleDegree)),
    y: Math.sin(degToRad(angleDegree)),
  }
}

export function alignHeadingToVelocity(so: SpaceObject) {
  so.angleDegree = radToDeg(Math.atan2(so.velocity.y, so.velocity.x))
}

export function isColliding(so0: SpaceObject, so1: SpaceObject): boolean {
  if (
    so0.position.x < so1.position.x + so1.size.x &&
    so0.position.x + so0.size.x > so1.position.x &&
    so0.position.y < so1.position.y + so1.size.y &&
    so0.position.y + so0.size.y > so1.position.y
  ) {
    return true
  }
  return false
}

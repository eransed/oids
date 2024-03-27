import type { Bounceable, Bounded, Collidable, Damager, Physical, Rotatable, SpaceObject } from '../interface'
import { add2, degToRad, magnitude2, radToDeg, scalarMultiply2, smul2, sub2, type Vec2, newVec2, limitVec2, warn, good, bad, error } from 'mathil'
import { renderHitExplosion } from '../render/renderFx'
import { handleDeathExplosion, handleHittingShot } from '../mechanics'
import { angularFriction, explosionDuration, linearFriction, missileDamageVelocityTransferFactor, timeScale } from '../constants'
import type { Shape } from '../shapes/Shape'
import { updateShots } from './updateShots'

export function updateShape(shape: Shape, dt: number): void {
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2 = scalarMultiply2(shape.velocity, deltaTime)
  const a: Vec2 = scalarMultiply2(shape.acceleration, deltaTime)
  shape.velocity = add2(shape.velocity, a)
  shape.position = add2(shape.position, v)
  shape.acceleration = { x: 0, y: 0 }
  shape.velocity = limitVec2(shape.velocity, { x: 200, y: 200 })
}

export function updateShapes(shapes: Shape[], frameTimeMs: number): void {
  shapes.forEach((s) => {
    updateShape(s, frameTimeMs)
  })
}

export function updateSpaceObject(so: SpaceObject, dt: number): SpaceObject {
  // If assigning nan to npc.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return so
  const deltaTime: number = dt * timeScale
  const v: Vec2 = scalarMultiply2(so.velocity, deltaTime)
  const a: Vec2 = scalarMultiply2(so.acceleration, deltaTime)
  so.velocity = add2(so.velocity, a)
  so.position = add2(so.position, v)
  so.cameraVelocity = smul2(v, 1)
  so.cameraPosition = add2(so.cameraPosition, so.cameraVelocity)
  so.acceleration = { x: 0, y: 0 }
  so.velocity = limitVec2(so.velocity, { x: 250, y: 250 })
  so.angleDegree += so.angularVelocity * deltaTime
  if (so.health <= 0) {
    handleDeathExplosion(so, explosionDuration)
  }
  if (so.shotsInFlight) {
    updateShots(so, deltaTime)
  }

  // if (npc.angleDegree < 0) npc.angleDegree = 360
  // if (npc.angleDegree > 360) npc.angleDegree = 0

  return so
}

export function updateSpaceObjects(npcs: SpaceObject[], frameTimeMs: number): void {
  for (let i = 0; i < npcs.length; i++) {
    updateSpaceObject(npcs[i], frameTimeMs)
  }
}

export function offScreen_mm(v: Vec2, screen_min: Vec2, screen_max: Vec2) {
  if (v.x > screen_max.x) return true
  if (v.x < screen_min.x) return true
  if (v.y > screen_max.y) return true
  if (v.y < screen_min.y) return true
  return false
}

export function wrap_mm(v: Vec2, min: Vec2, max: Vec2): void {
  if (v.x > max.x) v.x = min.x
  if (v.x < min.x) v.x = max.x
  if (v.y > max.y) v.y = min.y
  if (v.y < min.y) v.y = max.y
}

export function gravity(from: SpaceObject, to: SpaceObject, G = 1): void {
  // F = G((m0 * m1)/r^2)

  const m0: number = from.mass
  const m1: number = to.mass
  const v01: Vec2 = sub2(getWorldCoordinates(from), getWorldCoordinates(to))
  const r: number = magnitude2(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2 = scalarMultiply2(v01, F)
  to.acceleration = add2(to.acceleration, gvec)
  console.log(r2)
}

export function gravityStars(from: SpaceObject, to: SpaceObject, G = 1): void {
  // F = G((m0 * m1)/r^2)

  const m0 = from.mass
  const m1: number = to.mass
  const v01: Vec2 = sub2(getWorldCoordinates(from), getWorldCoordinates(to))
  const r: number = magnitude2(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2 = scalarMultiply2(v01, F)
  to.acceleration = add2(to.acceleration, gvec)
}

export function friction(p: Physical & Rotatable) {
  // const head: Vec2 = getHeading(p)
  // const fric: Vec2 = mul(head, linearFriction)
  p.velocity = smul2(p.velocity, linearFriction.x)
  p.angularVelocity = p.angularVelocity * angularFriction
}

export function applyFriction(npc: Physical, friction: number) {
  npc.velocity = scalarMultiply2(npc.velocity, friction)
}

export function getHeading(p: Physical & Rotatable): Vec2 {
  return {
    x: Math.cos(degToRad(p.angleDegree)),
    y: Math.sin(degToRad(p.angleDegree)),
  }
}

export function headingFromangle2(angleDegree: number): Vec2 {
  return {
    x: Math.cos(degToRad(angleDegree)),
    y: Math.sin(degToRad(angleDegree)),
  }
}

export function alignHeadingToVelocity(p: Physical & Rotatable): void {
  p.angleDegree = radToDeg(Math.atan2(p.velocity.y, p.velocity.x))
}

// export function alignVelocityToHeading(p: Physical): void {
//   p.velocity = scalarMultiply2(headingFromangle2(p.angleDegree), magnitude2(p.velocity))
// }

export function isWithinRadiusWorld(p0: Physical & Bounded, p1: Physical & Bounded, radius: number): boolean {
  const d: number = magnitude2(sub2(getWorldCoordinates(p0), getWorldCoordinates(p1)))
  if (d < radius) {
    return true
  }
  return false
}

export function isWithinRadius(p0: Physical, p1: Physical & Bounded, radius: number): boolean {
  const d: number = magnitude2(sub2(p0.position, getWorldCoordinates(p1)))
  if (d <= radius) {
    return true
  }
  return false
}

export function getWorldCoordinates(e: (Physical & Bounded) | null): Vec2 {
  if (e) {
    return add2(e.viewFramePosition, e.cameraPosition)
  }
  return newVec2()
}

export function getRemotePosition(remoteObject: SpaceObject, localObject: SpaceObject) {
  const position = sub2(add2(remoteObject.viewFramePosition, remoteObject.cameraPosition), localObject.cameraPosition)
  return position
}

export function resetCollisions(spaceObjects: Collidable[]) {
  for (const npc of spaceObjects) {
    npc.colliding = false
    npc.collidingWith = []
  }
}
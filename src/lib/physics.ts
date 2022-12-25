import type { SpaceObject, Vec2d } from "./types"
import { add, degToRad, limitv, magnitude, radToDeg, scalarMultiply, sub, vec2d } from "./math"
import { getScreenFromCanvas } from "./utils"

export function updateSpaceObject(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  so.position = add(so.position, so.velocity)
  so.velocity = add(so.velocity, so.acceleration)

  // coolDown(so)
  for (let shot of so.shotsInFlight) {
    shot.position = add(shot.position, shot.velocity)
    shot.velocity = add(shot.velocity, shot.acceleration)
    shot.acceleration = {x: 0, y: 0}

    shot.armedDelay--
    // bounceSpaceObject(shot, screen, 1, 0, 0.7)
    alignHeadingToVelocity(shot)
    // handleHittingShot(shot, ctx)
  }
  decayOffScreenShotsPadded(so, getScreenFromCanvas(ctx), 1.5)
  // decayDeadShots(so)
  // removeShotsAfterBounces(so, 2)

  so.acceleration = {x: 0, y: 0}
  // so.velocity = limitv(so.velocity, {x: 0.1, y: 0.1})
  // so.acceleration = limitv(so.acceleration, {x: 0.005, y: 0.005})
}

export function updateSpaceObjects(sos: SpaceObject[], ctx: CanvasRenderingContext2D): void {
  sos.forEach((so) => {
    updateSpaceObject(so, ctx)
  })
}

export function decayOffScreenShots(so: SpaceObject, screen: Vec2d) {
  so.shotsInFlight = so.shotsInFlight.filter(function (e) {
    return !offScreen(e.position, screen)
  })
}

export function decayOffScreenShotsPadded(so: SpaceObject, screen: Vec2d, padFac: number = 1) {
  so.shotsInFlight = so.shotsInFlight.filter(function (e) {
    return !offScreen_mm(e.position, scalarMultiply(screen, -padFac), scalarMultiply(screen, padFac))
  })
}

export function offScreen(v: Vec2d, screen: Vec2d) {
  if (v.x > screen.x) return true
  if (v.x < 0) return true
  if (v.y > screen.y) return true
  if (v.y < 0) return true
  return false
}

export function offScreen_mm(v: Vec2d, screen_min: Vec2d, screen_max: Vec2d) {
  if (v.x > screen_max.x) return true
  if (v.x < screen_min.x) return true
  if (v.y > screen_max.y) return true
  if (v.y < screen_min.y) return true
  return false
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

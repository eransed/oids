import type { SpaceObject, Vec2d } from "./types"
import { add, degToRad, magnitude, radToDeg, rndi, scalarMultiply, sub } from "./math"
import { getScreenFromCanvas } from "./utils"
import { renderExplosionFrame } from "./render"
import { decayDeadShots, handleHittingShot } from "./mechanics"
import { timeDuration } from "./constants"

export function updateSpaceObject(so: SpaceObject, dt: number, ctx: CanvasRenderingContext2D): void {
  // If assigning nan to so.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeDuration
  const v: Vec2d = scalarMultiply(so.velocity, deltaTime)
  const a: Vec2d = scalarMultiply(so.acceleration, deltaTime)
  so.velocity = add(so.velocity, a)
  so.position = add(so.position, v)
  so.acceleration = {x: 0, y: 0}
  updateShots(so, ctx)
}

export function updateSpaceObjects(sos: SpaceObject[], frameTimeMs: number, ctx: CanvasRenderingContext2D): void {
  sos.forEach((so) => {
    updateSpaceObject(so, frameTimeMs, ctx)
  })
}

export function updateShots(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  decayOffScreenShotsPadded(so, getScreenFromCanvas(ctx), 1.2)
  decayDeadShots(so)

  // coolDown(so)
  for (let shot of so.shotsInFlight) {
    shot.position = add(shot.position, shot.velocity)
    shot.velocity = add(shot.velocity, shot.acceleration)
    shot.acceleration = {x: 0, y: 0}
    shot.armedDelay--
    alignHeadingToVelocity(shot)

    // bounceSpaceObject(shot, screen, 1, 0, 0.7)
    handleHittingShot(shot, ctx)
  }
  // removeShotsAfterBounces(so, 2)
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
  // F = G((m0 * m1)/r^2)
  const m0: number = from.mass
  const m1: number = to.mass
  const v01: Vec2d = sub(from.position, to.position)
  const r: number = magnitude(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2d = scalarMultiply(v01, F)
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


export function edgeBounceSpaceObject(
  so: SpaceObject,
  screen: Vec2d,
  energyFactor: number = 1,
  gap: number = 1,
  damageDeltaFactor: number
) {
  if (so.position.x < gap) {
    so.velocity.x = -so.velocity.x * energyFactor
    so.position.x = gap
    so.bounceCount++
    so.damage = so.damage * damageDeltaFactor
  }
  if (so.position.x >= screen.x) {
    so.velocity.x = -so.velocity.x * energyFactor
    so.position.x = screen.x - gap
    so.bounceCount++
    so.damage = so.damage * damageDeltaFactor
  }
  if (so.position.y < gap) {
    so.velocity.y = -so.velocity.y * energyFactor
    so.position.y = gap
    so.bounceCount++
    so.damage = so.damage * damageDeltaFactor
  }
  if (so.position.y >= screen.y) {
    so.velocity.y = -so.velocity.y * energyFactor
    so.position.y = screen.y - gap
    so.bounceCount++
    so.damage = so.damage * damageDeltaFactor
  }
}


export function handleCollisions(spaceObjects: SpaceObject[], ctx: CanvasRenderingContext2D) {
  resetCollisions(spaceObjects)
  for (let so0 of spaceObjects) {
    for (let so1 of spaceObjects) {
      if (isColliding(so0, so1) && so0.name !== so1.name) {
        so0.colliding = true
        so1.colliding = true
        so0.collidingWith.push(so1)
        so1.collidingWith.push(so0)
        so0.health -= 250
        so1.health -= 250
        renderExplosionFrame(so0.position, ctx)
        renderExplosionFrame(so1.position, ctx)
      }
      for (let shot of so0.shotsInFlight) {
        if (shot.armedDelay < 0) {
          const heading: Vec2d = scalarMultiply(headingFromAngle(shot.angleDegree), 0.1)
          if (isColliding(shot, so0) && shot.didHit === false) {
            so0.health -= shot.damage
            so0.velocity = add(so0.velocity, heading)
            shot.didHit = true
          }
          if (isColliding(shot, so1) && shot.didHit === false) {
            so1.health -= shot.damage
            so1.velocity = add(so1.velocity, heading)
            shot.didHit = true
          }
        }
      }
    }
  }
}

export function resetCollisions(spaceObjects: SpaceObject[]) {
  for (let so of spaceObjects) {
    so.colliding = false
    so.collidingWith = []
  }
}

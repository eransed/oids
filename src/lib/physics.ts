import type { Bounceable, Damager, Physical, Rotatable, SpaceObject, Vec2d } from './types'
import { add, degToRad, limitv, magnitude, radToDeg, scalarMultiply, smul, sub } from './math'
import { getScreenFromCanvas } from './canvas_util'
import { renderExplosionFrame } from './render'
import { coolDown, decayDeadShots, handleHittingShot } from './mechanics'
import { angularFriction, collisionFrameDamage, linearFriction, missileDamageVelocityTransferFactor, timeScale } from './constants'
import { health } from './stores'

export function updateSpaceObject(so: SpaceObject, dt: number, ctx: CanvasRenderingContext2D): void {
  // If assigning nan to so.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2d = scalarMultiply(so.velocity, deltaTime)
  const a: Vec2d = scalarMultiply(so.acceleration, deltaTime)
  so.velocity = add(so.velocity, a)
  so.position = add(so.position, v)
  so.acceleration = { x: 0, y: 0 }
  so.velocity = limitv(so.velocity, { x: 250, y: 250 })
  // so.angleDegree += so.angularVelocity * deltaTime
  updateShots(so, deltaTime, ctx)
}

export function updateSpaceObjects(sos: SpaceObject[], frameTimeMs: number, ctx: CanvasRenderingContext2D): void {
  sos.forEach((so) => {
    updateSpaceObject(so, frameTimeMs, ctx)
  })
}

export function updateShots(so: SpaceObject, dts: number, ctx: CanvasRenderingContext2D): void {
  if (isNaN(dts)) return

  decayOffScreenShotsPadded(so, getScreenFromCanvas(ctx), 1.2)
  decayDeadShots(so)

  coolDown(so)
  if (so.framesSinceLastShot > 0) {
    so.framesSinceLastShot--
  }

  for (const shot of so.shotsInFlight) {
    const v: Vec2d = scalarMultiply(shot.velocity, dts)
    const a: Vec2d = scalarMultiply(shot.acceleration, dts)
    shot.velocity = add(shot.velocity, a)
    shot.position = add(shot.position, v)
    shot.angleDegree += shot.angularVelocity * dts
    // alignVelocityToHeading(shot)
    alignHeadingToVelocity(shot)

    shot.acceleration = { x: 0, y: 0 }
    shot.armedDelay--

    // bounceSpaceObject(shot, screen, 1, 0, 0.7)
    //handleHittingShot(shot, ctx)
  }
  // removeShotsAfterBounces(so, 2)
}

export function decayOffScreenShots(so: SpaceObject, screen: Vec2d) {
  so.shotsInFlight = so.shotsInFlight.filter(function (e) {
    return !offScreen(e.position, screen)
  })
}

export function decayOffScreenShotsPadded(so: SpaceObject, screen: Vec2d, padFac = 1) {
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

export function gravity(from: Physical, to: Physical, G = 1): void {
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

export function friction(p: Physical & Rotatable) {
  // const head: Vec2d = getHeading(p)
  // const fric: Vec2d = mul(head, linearFriction)
  p.velocity = smul(p.velocity, linearFriction.x)
  p.angularVelocity = p.angularVelocity * angularFriction
}

export function applyFriction(so: Physical, friction: number) {
  so.velocity = scalarMultiply(so.velocity, friction)
}

export function getHeading(p: Physical & Rotatable): Vec2d {
  return {
    x: Math.cos(degToRad(p.angleDegree)),
    y: Math.sin(degToRad(p.angleDegree)),
  }
}

export function headingFromAngle(angleDegree: number): Vec2d {
  return {
    x: Math.cos(degToRad(angleDegree)),
    y: Math.sin(degToRad(angleDegree)),
  }
}

export function alignHeadingToVelocity(p: Physical & Rotatable): void {
  p.angleDegree = radToDeg(Math.atan2(p.velocity.y, p.velocity.x))
}

// export function alignVelocityToHeading(p: Physical): void {
//   p.velocity = scalarMultiply(headingFromAngle(p.angleDegree), magnitude(p.velocity))
// }

export function isColliding(p0: Physical, p1: Physical): boolean {
  if (
    p0.position.x < p1.position.x + p1.size.x &&
    p0.position.x + p0.size.x > p1.position.x &&
    p0.position.y < p1.position.y + p1.size.y &&
    p0.position.y + p0.size.y > p1.position.y
  ) {
    return true
  }
  return false
}

export function isWithinRadius(p0: Physical, p1: Physical, radius: number): boolean {
  const d: number = magnitude(sub(p0.position, p1.position))
  if (d < radius) {
    return true
  }
  return false
}

export function edgeBounceSpaceObject(p: Physical & Damager & Bounceable, screen: Vec2d, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
  if (p.position.x < gap) {
    p.velocity.x = -p.velocity.x * energyFactor
    p.position.x = gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.x >= screen.x) {
    p.velocity.x = -p.velocity.x * energyFactor
    p.position.x = screen.x - gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.y < gap) {
    p.velocity.y = -p.velocity.y * energyFactor
    p.position.y = gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
  if (p.position.y >= screen.y) {
    p.velocity.y = -p.velocity.y * energyFactor
    p.position.y = screen.y - gap
    p.bounceCount++
    p.damage = p.damage * damageDeltaFactor
  }
}

export function handleCollisions(spaceObjects: SpaceObject[], ctx: CanvasRenderingContext2D): void {
  resetCollisions(spaceObjects)
  for (const so0 of spaceObjects) {
    for (const so1 of spaceObjects) {
      if (isColliding(so0, so1) && so0.name !== so1.name) {
        so0.colliding = true
        so1.colliding = true
        so0.collidingWith.push(so1)
        so1.collidingWith.push(so0)
        so0.health -= collisionFrameDamage
        so1.health -= collisionFrameDamage
        renderExplosionFrame(so0.position, ctx)
        renderExplosionFrame(so1.position, ctx)
      }
      for (const shot of so0.shotsInFlight) {
        if (shot.armedDelay < 0) {
          const heading: Vec2d = scalarMultiply(headingFromAngle(shot.angleDegree), shot.damage * missileDamageVelocityTransferFactor)
          if (isWithinRadius(shot, so0, so0.hitRadius) && shot.didHit === false) {
            so0.health -= shot.damage
            so0.velocity = add(so0.velocity, heading)
            shot.didHit = true
            health.set(so0.health)
          }
          if (isWithinRadius(shot, so1, so1.hitRadius) && shot.didHit === false) {
            so1.health -= shot.damage
            so1.velocity = add(so1.velocity, heading)
            shot.didHit = true
          }
        }

        handleHittingShot(shot, ctx)
      }
    }
  }
}

export function resetCollisions(spaceObjects: SpaceObject[]) {
  for (const so of spaceObjects) {
    so.colliding = false
    so.collidingWith = []
  }
}

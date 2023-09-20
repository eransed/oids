import type { Bounceable, Bounded, Collidable, Damager, NonPlayerCharacter, Physical, Rotatable, SpaceObject } from './interface'
import { add, degToRad, info, limitv, magnitude, radToDeg, scalarMultiply, smul, sub, warn, type Vec2, getScreenRect, newVec2 } from 'mathil'
import { getScreenCenterPosition, getScreenFromCanvas } from './canvas_util'
import { renderHitExplosion } from './render/renderFx'
import { coolDown, decayDeadShots, handleHittingShot } from './mechanics'
import { angularFriction, collisionFrameDamage, linearFriction, missileDamageVelocityTransferFactor, screenPaddingFactor, timeScale } from './constants'
import type { Shape } from './shapes/Shape'

export function updateShape(shape: Shape, dt: number): void {
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2 = scalarMultiply(shape.velocity, deltaTime)
  const a: Vec2 = scalarMultiply(shape.acceleration, deltaTime)
  shape.velocity = add(shape.velocity, a)
  shape.position = add(shape.position, v)
  shape.acceleration = { x: 0, y: 0 }
  shape.velocity = limitv(shape.velocity, { x: 200, y: 200 })
}

export function updateShapes(shapes: Shape[], frameTimeMs: number): void {
  shapes.forEach((s) => {
    updateShape(s, frameTimeMs)
  })
}

export function updateSpaceObject(npc: SpaceObject | NonPlayerCharacter, dt: number, ctx: CanvasRenderingContext2D): void {
  // If assigning nan to npc.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) return
  const deltaTime: number = dt * timeScale
  const v: Vec2 = scalarMultiply(npc.velocity, deltaTime)
  const a: Vec2 = scalarMultiply(npc.acceleration, deltaTime)
  npc.velocity = add(npc.velocity, a)
  npc.position = add(npc.position, v)
  // npc.position = vec2Bound(npc.position, sub(smul(npc.worldSize, 0.5), getScreenRect(ctx)))
  npc.acceleration = { x: 0, y: 0 }
  npc.velocity = limitv(npc.velocity, { x: 250, y: 250 })
  npc.angleDegree += npc.angularVelocity * deltaTime
  if (npc.angleDegree < 0) npc.angleDegree = 360
  if (npc.angleDegree > 360) npc.angleDegree = 0
  updateShots(npc, deltaTime, ctx)
}

export function updateNonPlayerCharacter(npc: NonPlayerCharacter, dt: number): NonPlayerCharacter {
  // If assigning nan to npc.velocity, position or acceleration it will stay nan for ever
  if (isNaN(dt)) {
    console.log(`nan!`)
    return npc
  }
  const deltaTime: number = dt * timeScale
  const v: Vec2 = scalarMultiply(npc.velocity, deltaTime)
  const a: Vec2 = scalarMultiply(npc.acceleration, deltaTime)
  npc.velocity = add(npc.velocity, a)
  npc.position = add(npc.position, v)
  npc.acceleration = { x: 0, y: 0 }
  npc.velocity = limitv(npc.velocity, { x: 250, y: 250 })
  npc.angleDegree += npc.angularVelocity * deltaTime
  if (npc.angleDegree < 0) npc.angleDegree = 360
  if (npc.angleDegree > 360) npc.angleDegree = 0
  return npc
}

export function updateSpaceObjects(npcs: (SpaceObject | NonPlayerCharacter)[], frameTimeMs: number, ctx: CanvasRenderingContext2D): void {
  npcs.forEach((npc) => {
    updateSpaceObject(npc, frameTimeMs, ctx)
  })
}

export function updateShots(npc: SpaceObject | NonPlayerCharacter, dts: number, ctx: CanvasRenderingContext2D): void {
  if (isNaN(dts)) return

  //  decayOffScreenShotsPadded(npc, getScreenFromCanvas(ctx), screenPaddingFactor)
  decayOffScreenShots(npc, npc.worldSize)
  decayDeadShots(npc)

  coolDown(npc)
  if (npc.framesSinceLastShot > 0) {
    npc.framesSinceLastShot--
  }

  for (const shot of npc.shotsInFlight) {
    const v: Vec2 = scalarMultiply(shot.velocity, dts)
    const a: Vec2 = scalarMultiply(shot.acceleration, dts)
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
  // removeShotsAfterBounces(npc, 2)
}

export function decayOffScreenShots(npc: SpaceObject | NonPlayerCharacter, screen: Vec2) {
  npc.shotsInFlight = npc.shotsInFlight.filter(function (e) {
    return !offScreen(e.position, screen)
  })
}

export function decayOffScreenShotsPadded(npc: SpaceObject | NonPlayerCharacter, screen: Vec2, padFac = 1) {
  npc.shotsInFlight = npc.shotsInFlight.filter(function (e) {
    return !offScreen_mm(e.position, scalarMultiply(screen, -padFac), scalarMultiply(screen, padFac))
  })
}

export function vec2Bound(v: Vec2, bound: Vec2) {
  if (v.x > bound.x) v.x = bound.x
  if (v.x < 0) v.x = 0
  if (v.y > bound.y) v.y = bound.y
  if (v.y < 0) v.y = 0
  return v
}

export function vec2Bound_mm(
  v: Vec2,
  bound_min: Vec2,
  bound_max: Vec2,
  callback: () => void = () => {
    /** default */
  }
) {
  if (v.x > bound_max.x) {
    v.x = bound_max.x
    callback()
  }
  if (v.x < bound_min.x) {
    v.x = bound_min.x
    callback()
  }
  if (v.y > bound_max.y) {
    v.y = bound_max.y
    callback()
  }
  if (v.y < bound_min.y) {
    v.y = bound_min.y
    callback()
  }
  return v
}

export function offScreen(v: Vec2, screen: Vec2) {
  if (v.x > screen.x) return true
  if (v.x < 0) return true
  if (v.y > screen.y) return true
  if (v.y < 0) return true
  return false
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

export function gravity(from: SpaceObject | NonPlayerCharacter, to: SpaceObject | NonPlayerCharacter, G = 1): void {
  // F = G((m0 * m1)/r^2)
  const m0: number = from.mass
  const m1: number = to.mass
  const v01: Vec2 = sub(getWorldCoordinates(from), getWorldCoordinates(to))
  const r: number = magnitude(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2 = scalarMultiply(v01, F)
  to.acceleration = add(to.acceleration, gvec)
}

export function gravityStars(from: NonPlayerCharacter, to: NonPlayerCharacter, G = 1): void {
  // F = G((m0 * m1)/r^2)

  const m0 = from.mass
  const m1: number = to.mass
  const v01: Vec2 = sub(getWorldCoordinates(from), getWorldCoordinates(to))
  const r: number = magnitude(v01)
  const r2: number = Math.pow(r, 2)
  const F: number = G * ((m0 * m1) / r2)
  const gvec: Vec2 = scalarMultiply(v01, F)
  to.acceleration = add(to.acceleration, gvec)
}

export function friction(p: Physical & Rotatable) {
  // const head: Vec2 = getHeading(p)
  // const fric: Vec2 = mul(head, linearFriction)
  p.velocity = smul(p.velocity, linearFriction.x)
  p.angularVelocity = p.angularVelocity * angularFriction
}

export function applyFriction(npc: Physical, friction: number) {
  npc.velocity = scalarMultiply(npc.velocity, friction)
}

export function getHeading(p: Physical & Rotatable): Vec2 {
  return {
    x: Math.cos(degToRad(p.angleDegree)),
    y: Math.sin(degToRad(p.angleDegree)),
  }
}

export function headingFromAngle(angleDegree: number): Vec2 {
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

export function isWithinRadiusWorld(p0: Physical & Bounded, p1: Physical & Bounded, radius: number): boolean {
  const d: number = magnitude(sub(getWorldCoordinates(p0), getWorldCoordinates(p1)))
  if (d < radius) {
    return true
  }
  return false
}

export function isWithinRadius(p0: Physical, p1: Physical & Bounded, radius: number): boolean {
  const d: number = magnitude(sub(p0.position, getWorldCoordinates(p1)))
  if (d < radius) {
    return true
  }
  return false
}

export function getWorldCoordinates(e: Physical & Bounded): Vec2 {
  return add(e.viewFramePosition, e.cameraPosition)
}

export function edgeBounceSpaceObject(p: Physical & Damager & Bounceable, screen: Vec2, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
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

export function handleCollisions(cameraPosition: Vec2, spaceObjects: NonPlayerCharacter[], ctx: CanvasRenderingContext2D): void {
  resetCollisions(spaceObjects)
  for (const npc0 of spaceObjects) {
    if (npc0.isDead) continue

    for (const npc1 of spaceObjects) {
      if (npc1.isDead) continue
      //  if (isColliding(npc0, npc1) && npc0.name !== npc1.name) {
      if (isWithinRadiusWorld(npc0, npc1, npc1.hitRadius) && npc0.name !== npc1.name) {
        npc0.colliding = true
        npc1.colliding = true
        npc0.collidingWith.push(npc1)
        npc1.collidingWith.push(npc0)
        npc0.health -= collisionFrameDamage
        npc1.health -= collisionFrameDamage

        const relative0 = sub(getWorldCoordinates(npc0), smul(cameraPosition, 1))
        const relative1 = sub(getWorldCoordinates(npc1), smul(cameraPosition, 1))
        renderHitExplosion(relative0, ctx)
        renderHitExplosion(relative1, ctx)

        const f = -0.005
        // npc0.velocity = smul(npc0.velocity, f * npc1.mass)
        // npc1.velocity = smul(npc0.velocity, -f * npc0.mass)
      }
      for (const shot of npc0.shotsInFlight) {
        if (shot.armedDelay < 0) {
          const heading: Vec2 = scalarMultiply(headingFromAngle(shot.angleDegree), shot.damage * missileDamageVelocityTransferFactor)

          if (isWithinRadius(shot, npc1, npc1.hitRadius) && shot.didHit === false) {
            npc1.health -= shot.damage
            npc1.velocity = add(npc1.velocity, heading)
            npc1.lastDamagedByName = shot.ownerName
            shot.didHit = true
            if (npc1.health < 1) {
              if (addIfNotExists(npc1.name, npc0.kills) === true) {
                console.log('You killed: ' + npc1.name)
                npc0.killCount = npc0.kills.length
                npc1.killedByName = npc1.lastDamagedByName
                npc1.isDead = true
                npc1.health = 0
              }
            }
          }
        }

        handleHittingShot(cameraPosition, shot, ctx)
      }
    }
  }
}

export function addIfNotExists(str: string, arr: string[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === str) {
      return false
    }
  }
  arr.push(str)
  return true
}

export function resetCollisions(spaceObjects: Collidable[]) {
  for (const npc of spaceObjects) {
    npc.colliding = false
    npc.collidingWith = []
  }
}

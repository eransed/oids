import type { Boostable, Bounceable, Damageable, Damager, Physical, Positionable, SpaceObject, Thrustable, Vec2d } from './types'
import type { Steerable } from './traits/Steerable'

import { scalarMultiply, wrap, rndf, add, rndi, copy, degToRad } from './math'
import { maxHeat, shotHitReversFactor } from './constants'
import { renderExplosionFrame } from './render'
import { createSpaceObject } from './factory'
import { getHeading } from './physics'
import { randomLightGreen } from './color'

export function applyEngine(so: Thrustable & Boostable, boost = false): number {
  const consumption: number = so.enginePower * (boost ? so.booster : 1)
  if (so.batteryLevel > 0) {
    so.batteryLevel -= consumption
    return consumption
  }
  so.batteryLevel = 0
  return 0
}

export function applySteer(so: Steerable, dir: number, deltaTimeScaled: number): void {
  so.angleDegree += dir * so.steeringPower * deltaTimeScaled
  // so.angularVelocity += dir * so.steeringPower
}

export function getThrustVector(so: Thrustable & Steerable & Boostable, dirAng: number, boost = false): Vec2d {
  const angleRadians: number = degToRad(so.angleDegree + dirAng)
  const engine: number = applyEngine(so, boost)
  return {
    x: engine * Math.cos(angleRadians),
    y: engine * Math.sin(angleRadians),
  }
}

export function applyEngineThrust(so: Thrustable & Steerable & Boostable, directionDeg: number, boost = false): void {
  so.velocity = add(so.velocity, getThrustVector(so, directionDeg, boost))
  // so.acceleration = add(so.acceleration, getThrustVector(so, directionDeg))
}

export function wrapSpaceObject(so: Positionable, screen: Vec2d): void {
  // To do: Make it appear where it entered...
  wrap(so.position, screen)
  // mirrorWrap(so.position, screen)
}

export function decayDeadShots(so: SpaceObject) {
  so.shotsInFlight = <SpaceObject[]>decayDeadSpaceObjects(so.shotsInFlight)
}

export function coolDown(so: SpaceObject) {
  if (so.canonCoolDown >= maxHeat) {
    so.canonOverHeat = true
  }

  so.canonCoolDown -= so.canonCoolDownSpeed
  if (so.canonCoolDown < 1) {
    so.canonCoolDown = 0
    so.canonOverHeat = false
  }
}

export function generateMissileFrom(so: SpaceObject): SpaceObject {
  const shot: SpaceObject = createSpaceObject()
  shot.mass = 10
  // shot.angularVelocity = rndi(-70, 70)
  shot.damage = so.missileDamage
  shot.size = { x: rndi(4, 5), y: rndi(19, 25) }
  // shot.color = randomLightGreen()
  shot.color = so.photonColor
  let head: Vec2d = copy(so.position)
  const aimError = 6 // 8
  const headError = 0.32 // 0.019
  const speedError = 7 // 1.8

  head = add(head, scalarMultiply(getHeading(so), 0))

  head = add(head, {
    x: rndi(-aimError, aimError),
    y: rndi(-aimError, aimError),
  })

  shot.velocity = scalarMultiply(getHeading(so), so.missileSpeed + rndf(0, speedError))

  shot.velocity = add(shot.velocity, {
    x: rndf(-headError, headError),
    y: rndf(-headError, headError),
  })

  shot.position = head
  shot.angleDegree = so.angleDegree

  return shot
}

export function fire(so: SpaceObject): void {
  if (so.ammo < 1) {
    return
  }
  if (so.canonOverHeat) {
    return
  }
  if (so.framesSinceLastShot > 0) {
    return
  }
  so.canonCoolDown += so.canonHeatAddedPerShot * so.inverseFireRate
  if (so.canonCoolDown > maxHeat) {
    return
  }

  so.framesSinceLastShot+=so.inverseFireRate
  
  const shotLeftToFire = so.ammo - so.shotsPerFrame < 0 ? so.shotsPerFrame - so.ammo : so.shotsPerFrame
  for (let i = 0; i < shotLeftToFire; i++) {
    so.shotsInFlight.push(generateMissileFrom(so))
  }
  
  so.ammo-=shotLeftToFire
}

export function handleHittingShot(shot: SpaceObject, ctx: CanvasRenderingContext2D): void {
  if (shot.didHit) {
    shot.shotBlowFrame--
    shot.velocity = scalarMultiply(shot.velocity, shotHitReversFactor)
    renderExplosionFrame(shot.position, ctx)
    if (shot.shotBlowFrame < 0) {
      shot.health = 0
    }
  }
}

export function offScreen(v: Vec2d, screen: Vec2d): boolean {
  if (v.x > screen.x) return true
  if (v.x < 0) return true
  if (v.y > screen.y) return true
  if (v.y < 0) return true
  return false
}

export function decayDeadSpaceObjects(so: Damageable[]): Damageable[] {
  const out: Damageable[] = so.filter(function (e) {
    return e.health > 0
  })
  return out
}

export function bounceSpaceObject(so: Physical & Damager & Bounceable, screen: Vec2d, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
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

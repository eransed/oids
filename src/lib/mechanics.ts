import type { Boostable, Damageable, NonPlayerCharacter, PhotonLaser, Positionable, SpaceObject, Thrustable } from './interface'
import type { Steerable } from './traits/Steerable'

import { scalarMultiply2, wrap, rndf, add2, rndi, copy2, degToRad, type Vec2, sub2, smul2 } from 'mathil'
import { maxHeat, shotHitReversFactor, thrustSteer, thrustSteerPowerFactor } from './constants'
import { renderHitExplosion } from './render/renderFx'
import { newPhotonLaser } from './factory'
import { getHeading } from './physics'

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
  if (thrustSteer) {
    so.angularVelocity += dir * so.steeringPower * thrustSteerPowerFactor
  } else {
    so.angleDegree += dir * so.steeringPower * deltaTimeScaled
  }
}

export function getThrustVector(so: Thrustable & Steerable & Boostable, dirAng: number, boost = false): Vec2 {
  const angleRadians: number = degToRad(so.angleDegree + dirAng)
  const engine: number = applyEngine(so, boost)
  return {
    x: engine * Math.cos(angleRadians),
    y: engine * Math.sin(angleRadians),
  }
}

export function applyEngineThrust(so: Thrustable & Steerable & Boostable, directionDeg: number, boost = false): void {
  so.velocity = add2(so.velocity, getThrustVector(so, directionDeg, boost))
  // so.acceleration = add2(so.acceleration, getThrustVector(so, directionDeg))
}

export function wrapSpaceObject(so: Positionable, screen: Vec2): void {
  // To do: Make it appear where it entered...
  wrap(so.position, screen)
  // mirrorWrap(so.position, screen)
}

export function decayDeadShots(so: SpaceObject | NonPlayerCharacter) {
  so.shotsInFlight = <PhotonLaser[]>decayDeadSpaceObjects(so.shotsInFlight)
}

export function coolDown(so: SpaceObject | NonPlayerCharacter) {
  if (so.canonCoolDown >= maxHeat) {
    so.canonOverHeat = true
  }

  so.canonCoolDown -= so.canonCoolDownSpeed
  if (so.canonCoolDown < 1) {
    so.canonCoolDown = 0
    so.canonOverHeat = false
  }
}

export function generateMissileFrom(so: SpaceObject): PhotonLaser {
  // what is the type of the shot?
  const shot: PhotonLaser = newPhotonLaser()
  shot.armedDelay = so.armedDelay
  shot.mass = 10
  // shot.angularVelocity = rndi(-70, 70)
  shot.damage = so.missileDamage
  shot.size = { x: rndi(4, 6), y: rndi(20, 30) }
  // shot.color = randomLightGreen()
  shot.color = so.photonColor
  let head: Vec2 = copy2(add2(so.cameraPosition, so.viewFramePosition))
  const aimError = 8 // 8
  const headError = 0.34 // 0.019
  const speedError = 3 // 1.8

  head = add2(head, scalarMultiply2(getHeading(so), 0))

  head = add2(head, {
    x: rndi(-aimError, aimError),
    y: rndi(-aimError, aimError),
  })

  shot.velocity = scalarMultiply2(getHeading(so), 0.6 * so.missileSpeed + rndf(0, speedError))

  shot.velocity = add2(shot.velocity, {
    x: rndf(-headError, headError),
    y: rndf(-headError, headError),
  })

  shot.position = head
  shot.angleDegree = so.angleDegree
  shot.ownerName = so.name

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

  so.shotsFiredThisFrame = true

  so.framesSinceLastShot += so.inverseFireRate

  const shotLeftToFire = so.ammo - so.shotsPerFrame < 0 ? so.shotsPerFrame - so.ammo : so.shotsPerFrame
  for (let i = 0; i < shotLeftToFire; i++) {
    so.shotsInFlightNew.push(generateMissileFrom(so))
  }

  so.ammo -= shotLeftToFire
}

export function handleHittingShot(cameraPosition: Vec2, shot: PhotonLaser, ctx: CanvasRenderingContext2D): void {
  if (shot.didHit) {
    shot.shotBlowFrame--
    shot.velocity = scalarMultiply2(shot.velocity, shotHitReversFactor)
    const relative = sub2(shot.position, smul2(cameraPosition, 1))
    renderHitExplosion(relative, ctx)
    if (shot.shotBlowFrame < 0) {
      shot.health = 0
    }
  }
}

// export function offScreen(v: Vec2, screen: Vec2): boolean {
//   if (v.x > screen.x) return true
//   if (v.x < 0) return true
//   if (v.y > screen.y) return true
//   if (v.y < 0) return true
//   return false
// }

export function decayDeadSpaceObjects(so: Damageable[]): Damageable[] {
  const out: Damageable[] = so.filter(function (e) {
    return e.health > 0
  })
  return out
}

export function handleDeathExplosion(so: NonPlayerCharacter, maximumIncrement: number): void {
  //Increment deadframecount to use in render of explosion
  if (so.obliterated) {
    return
  }

  if (maximumIncrement < so.deadFrameCount) {
    so.obliterated = true
    return
  }
  so.deadFrameCount++
}

export function bounceSpaceObject(so: NonPlayerCharacter, screen: Vec2, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
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

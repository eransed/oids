import type { Boostable, Damageable, PhotonLaser, Positionable, SpaceObject, Thrustable } from './interface'
import type { Steerable } from './traits/Steerable'

import { scalarMultiply2, wrap, rndf, add2, rndi, copy2, degToRad, type Vec2, sub2, smul2, mag2, newVec2, angle2, dist2, lintra } from 'mathil'
import { basicPhotonLaserSpeedScaleFactor, maxHeat, shotHitReversFactor, thrustSteer, thrustSteerPowerFactor } from './constants'
import { renderHitExplosion } from './render/renderFx'
import { newPhotonLaser } from './factory'
import { getDistance, getHeading, getWorldCoordinates } from './physics/physics'

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

export function applyEngineThrust(so: Thrustable & Steerable & Boostable, directionDeg: number, boost = false, smul?: number): void {
  if (smul) {
    so.velocity = add2(so.velocity, smul2(getThrustVector(so, directionDeg, boost), smul))
  } else {
    so.velocity = add2(so.velocity, getThrustVector(so, directionDeg, boost))
  }
  // so.acceleration = add2(so.acceleration, getThrustVector(so, directionDeg))
}

export function wrapSpaceObject(so: Positionable, screen: Vec2): void {
  // To do: Make it appear where it entered...
  wrap(so.position, screen)
  // mirrorWrap(so.position, screen)
}

export function decayDeadShots(so: SpaceObject) {
  so.shotsInFlight = <PhotonLaser[]>decayDeadSpaceObjects(so.shotsInFlight)
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

export function generateMissileFrom(so: SpaceObject, size: Vec2 = newVec2(rndi(4, 6), rndi(20, 30))): PhotonLaser {
  // what is the type of the shot?
  const shot: PhotonLaser = newPhotonLaser()
  shot.armedDelay = so.armedDelay
  shot.mass = 1
  // shot.angularVelocity = rndi(-70, 70)

  shot.damage = so.missileDamage * lintra(mag2(size), 25, 100, 1, 5)

  shot.size = size

  // shot.color = randomLightGreen()
  shot.color = so.photonColor
  let canonPosition: Vec2 = copy2(add2(so.cameraPosition, so.viewFramePosition))
  const aimError = 8 // 8
  const headError = 0.34 // 0.019
  const speedMaxRandomnessError = 3 // 1.8

  canonPosition = add2(canonPosition, {
    x: rndi(-aimError, aimError),
    y: rndi(-aimError, aimError),
  })

  shot.velocity = scalarMultiply2(getHeading(so), mag2(so.velocity) + basicPhotonLaserSpeedScaleFactor * so.missileSpeed + rndf(0, speedMaxRandomnessError))

  shot.velocity = add2(shot.velocity, {
    x: rndf(-headError, headError),
    y: rndf(-headError, headError),
  })

  shot.position = canonPosition
  shot.angleDegree = so.angleDegree
  shot.ownerName = so.name

  return shot
}

export function fire(so: SpaceObject, size?: Vec2): void {
  if (so.ammo < 1) {
    // console.log(`${so.name} requested to shoot, but have no ammo`)
    return
  }
  if (so.canonOverHeat) {
    // console.log(`${so.name} requested to shoot, is overheated`)
    return
  }
  if (so.framesSinceLastShot > 0) {
    // console.log(`${so.name} requested to shoot, but frames... ${so.framesSinceLastShot}`)
    so.framesSinceLastShot = 0
    return
  }
  so.canonCoolDown += so.canonHeatAddedPerShot * so.inverseFireRate
  if (so.canonCoolDown > maxHeat) {
    // coolDown(so)
    // console.log(`${so.name} requested to shoot, but is on cooldown`)
    return
  }

  so.shotsFiredThisFrame = true

  so.framesSinceLastShot += so.inverseFireRate

  const shotLeftToFire = so.ammo - so.shotsPerFrame < 0 ? so.shotsPerFrame - so.ammo : so.shotsPerFrame

  // console.log(`${so.name} - shotLeftToFire: ${shotLeftToFire}`)

  for (let i = 0; i < shotLeftToFire; i++) {
    so.shotsInFlightNew.push(generateMissileFrom(so, size))
  }

  so.ammo -= shotLeftToFire
  // console.log(`${so.name} is shooting!`)
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

export function decayDeadSpaceObjects(so: Damageable[]): Damageable[] {
  const out: Damageable[] = so.filter(function (e) {
    return e.health > 0
  })
  return out
}

export function handleDeathExplosion(so: SpaceObject, maximumIncrement: number): void {
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

export function removeOblitiratedSpaceObjects(spaceObjects: SpaceObject[]) {
  spaceObjects = spaceObjects.filter((so) => {
    if (so.obliterated) {
      console.log(`Object with name ${so.name} is removed due to dead`)
    }
    return !so.obliterated
  })

  return spaceObjects
}

export function bounceSpaceObject(so: SpaceObject, screen: Vec2, energyFactor = 1, gap = 1, damageDeltaFactor: number) {
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

export function followSpaceObject(follower: SpaceObject, soToFollow: SpaceObject) {
  const followerPos = follower.cameraPosition
  const soToFollowPos = getWorldCoordinates(soToFollow)

  const distanceBetween = dist2(followerPos, soToFollowPos)

  // console.log(distanceBetween)

  if (distanceBetween > 300) {
    angleTo(follower, soToFollow)
    // console.log('Im too far away', distanceBetween)
    follower.velocity = add2(follower.velocity, getThrustVector(follower, 0, false))
  } else {
    follower.velocity = soToFollow.velocity
    follower.angleDegree = soToFollow.angleDegree
  }
}

export function angleTo(from: SpaceObject, to: SpaceObject) {
  const angleToShip = angle2(sub2(getWorldCoordinates(to), getWorldCoordinates(from)))
  from.angleDegree = rndf(0, 0) + angleToShip
}

export function flyToSpaceObject(so: SpaceObject, flyToObject: SpaceObject, dist: number = 1000) {
  const soPos = so.cameraPosition
  const flyToObjectPos = getWorldCoordinates(flyToObject)

  const distanceBetween = getDistance(so, flyToObject)

  const smulFactorForward = lintra(distanceBetween, dist, 2000, 0.01, 0.3)

  // console.log(smulFactor)

  if (distanceBetween > dist) {
    applyEngineThrust(so, 0, false, smulFactorForward)
  }

  if (distanceBetween <= dist) {
    so.velocity = smul2(so.velocity, 0.99)
  }

  // angleTo(so, flyToObject)
}

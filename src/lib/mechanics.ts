import type { SpaceObject, Vec2d } from "./types"
import { scalarMultiply, mirrorWrap, wrap, rndf, add, rndi, copy, degToRad } from "./math"
import { randomGreen } from "./color"
import { createSpaceObject } from "./utils"
import { heading } from "./physics"

export function applyEngine(so: SpaceObject): number {
  if (so.fuel > 0) {
    so.fuel -= so.enginePower
    return so.enginePower
  }
  so.fuel = 0
  console.log(so.name + " has no more fuel!", so)
  return 0
}

export function applySteer(so: SpaceObject): number {
  return so.steeringPower
}

export function getThrustVector(so: SpaceObject, dirAng: number): Vec2d {
  const angleRadians: number = degToRad(so.angleDegree + dirAng)
  const engine: number = applyEngine(so)
  return {
    x: engine * Math.cos(angleRadians),
    y: engine * Math.sin(angleRadians),
  }
}

export function applyEngineThrust(so: SpaceObject, directionDeg: number): void {
  so.velocity = add(so.velocity, getThrustVector(so, directionDeg))
  // so.acceleration = add(so.acceleration, getThrustVector(so, directionDeg))
}

export function wrapSpaceObject(so: SpaceObject, screen: Vec2d) {
  // To do: Make it appear where it entered...
  wrap(so.position, screen)
  // mirrorWrap(so.position, screen)
}

export function fire(so: SpaceObject) {
  if (so.ammo < 1) {
    console.log(so.name + " is out of ammo")
    return
  }
  if (so.canonOverHeat) {
    return
  }
  so.canonCoolDown += so.canonHeatAddedPerShot
  so.ammo--
  let shot: SpaceObject = createSpaceObject()
  shot.damage = so.missileDamage
  shot.size = { x: rndi(2, 3), y: rndi(30, 45) }
  shot.color = randomGreen()
  let head: Vec2d = copy(so.position)
  const aimError = 8
  const headError = 0.019
  const speedError = 1.8

  head = add(head, scalarMultiply(heading(so), 15))

  head = add(head, {
    x: rndi(-aimError, aimError),
    y: rndi(-aimError, aimError),
  })

  shot.velocity = scalarMultiply(
    heading(so),
    so.missileSpeed + rndf(0, speedError)
  )

  shot.velocity = add(shot.velocity, {
    x: rndf(-headError, headError),
    y: rndf(-headError, headError),
  })
  
  shot.position = head
  shot.angleDegree = so.angleDegree
  so.shotsInFlight.push(shot)
}

export function ofScreen(v: Vec2d, screen: Vec2d) {
  if (v.x > screen.x) return true
  if (v.x < 0) return true
  if (v.y > screen.y) return true
  if (v.y < 0) return true
  return false
}

export function decayDeadSpaceObjects(so: SpaceObject[]): SpaceObject[] {
  let out = so.filter(function (e) {
    return e.health > 0
  })
  return out
}

export function bounceSpaceObject(
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

import { type Vec2, sub2, scalarMultiply2, add2 } from 'mathil'
import { missileDamageVelocityTransferFactor } from '../constants'
import type { SpaceObject } from '../interface'
import { handleHittingShot } from '../mechanics'
import { renderHitExplosion } from '../render/renderFx'
import { resetCollisions, isWithinRadiusWorld, getWorldCoordinates, isWithinRadius, headingFromangle2 } from './physics'
import { circleBounce } from './CircleBounce'

export function handleCollisions(cameraPosition: Vec2, spaceObjects: SpaceObject[], ctx: CanvasRenderingContext2D | null = null): void {


  resetCollisions(spaceObjects)
  for (const npc0 of spaceObjects) {
    if (npc0.isDead) continue

    for (const npc1 of spaceObjects) {
      if (npc1.isDead) continue

      if (isWithinRadiusWorld(npc0, npc1, npc1.hitRadius) && npc0.name !== npc1.name) {
        // good(`collision!`)
        npc0.colliding = true
        npc1.colliding = true
        npc0.collidingWith.push(npc1)
        npc1.collidingWith.push(npc0)
        // npc0.health -= collisionFrameDamage
        // npc1.health -= collisionFrameDamage

        circleBounce(npc0, npc1)


        if (ctx) {
          const relative0 = sub2(getWorldCoordinates(npc0), cameraPosition)
          const relative1 = sub2(getWorldCoordinates(npc1), cameraPosition)
          renderHitExplosion(relative0, ctx)
          renderHitExplosion(relative1, ctx)
        }

        // const f = -0.005
        // npc0.velocity = smul2(npc0.velocity, f * npc1.mass)
        // npc1.velocity = smul2(npc0.velocity, -f * npc0.mass)
      }

      for (const shot of npc0.shotsInFlight) {
        if (shot.armedDelay < 0) {
          // no self fire
          if (shot.ownerName === npc1.name) continue

          if (isWithinRadius(shot, npc1, npc1.hitRadius) && shot.didHit === false) {
            // bad(`${shot.ownerName} did hit ${npc1.name}, hp: ${npc1.health}`)
            const heading: Vec2 = scalarMultiply2(headingFromangle2(shot.angleDegree), (1 / npc1.mass) * shot.damage * missileDamageVelocityTransferFactor)
            npc1.health -= shot.damage
            npc1.velocity = add2(npc1.velocity, heading)
            npc1.lastDamagedByName = shot.ownerName
            shot.didHit = true
            circleBounce(shot, npc1, 10, false)
            if (npc1.health < 1) {
              if (addIfNotExists(npc1.name, npc0.kills) === true) {
                console.log('You killed: ' + npc1.name)
                npc0.killCount = npc0.kills.length
                npc1.killedByName = npc1.lastDamagedByName
                npc1.isDead = true
                npc1.health = 0
              }
            }
          } else {
            // warn(`${shot.ownerName} missed ${npc1.name}, hp: ${npc1.health}`)
          }
        } else {
          // error(`${shot.ownerName} unarmed shot... ${npc1.name}, hp: ${npc1.health}`)
        }

        if (ctx) {
          handleHittingShot(cameraPosition, shot, ctx)
        }
      }
    }
  }
}

function addIfNotExists(str: string, arr: string[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === str) {
      return false
    }
  }
  arr.push(str)
  return true
}

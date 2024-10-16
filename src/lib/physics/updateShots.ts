import { type Vec2, scalarMultiply2, add2 } from 'mathil'
import { maxShotAge } from '../constants'
import type { SpaceObject } from '../interface'
import { decayDeadShots, coolDown } from '../mechanics'
import { alignHeadingToVelocity } from './physics'
import { timeScale } from '../constants'

export function updateShots(so: SpaceObject, dts: number): void {
  const deltaTime = dts * timeScale

  if (isNaN(dts)) return

  decayDeadShots(so)

  coolDown(so)
  if (so.framesSinceLastShot > 0) {
    so.framesSinceLastShot--
  }

  for (const shot of so.shotsInFlight) {
    const v: Vec2 = scalarMultiply2(shot.velocity, deltaTime)
    const a: Vec2 = scalarMultiply2(shot.acceleration, deltaTime)
    shot.velocity = add2(shot.velocity, a)
    shot.position = add2(shot.position, v)
    shot.angleDegree += shot.angularVelocity * deltaTime
    // alignVelocityToHeading(shot)
    alignHeadingToVelocity(shot)

    shot.acceleration = { x: 0, y: 0 }
    shot.armedDelay--
    shot.age += Math.floor(deltaTime * 100)
    if (shot.age > maxShotAge) {
      shot.health = -1
    }
  }
}

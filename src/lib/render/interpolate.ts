import { type Vec2, mag2, lintra, newVec2 } from 'mathil'
import type { SpaceObject } from '../interface'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function interpolate(remoteObject: SpaceObject, currentPos: Vec2, prevPosMap: Map<string, Vec2>) {
  let prevPos = prevPosMap.get(remoteObject.name)

  if (!prevPos) {
    prevPos = currentPos
    prevPosMap.set(remoteObject.name, prevPos)
  }

  const remoteSpeed = mag2(remoteObject.velocity)

  const lerpAlphaBlending = lintra(remoteSpeed, 0, 30, 0.4, 0.08)
  // Should be dynamic I guess
  const interpolatedPosX = lerp(prevPos.x, currentPos.x, lerpAlphaBlending)
  const interpolatedPosY = lerp(prevPos.y, currentPos.y, lerpAlphaBlending)
  const interpolatedPos = newVec2(interpolatedPosX, interpolatedPosY)
  prevPosMap.set(remoteObject.name, interpolatedPos)

  return { interpolatedPos, lerpAlphaBlending, remoteSpeed }
}

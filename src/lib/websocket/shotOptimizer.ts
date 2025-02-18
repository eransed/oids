import type { SpaceObject } from '../interface'

export function spaceObjectUpdateAndShotReciverOptimizer(possibleNewShots: SpaceObject, storedSpaceObject: SpaceObject): SpaceObject {
  if (possibleNewShots.name === storedSpaceObject.name) {
    // Store every previously shots fired
    const cachePhotonLasers = storedSpaceObject.shotsInFlight

    // the new shots
    const newShotsThisUpdate = possibleNewShots.shotsInFlight

    // concat the old and the new shots
    storedSpaceObject.shotsInFlight = [...cachePhotonLasers, ...newShotsThisUpdate]

    storedSpaceObject.cameraPosition = possibleNewShots.cameraPosition
    storedSpaceObject.viewFramePosition = possibleNewShots.viewFramePosition
    storedSpaceObject.angleDegree = possibleNewShots.angleDegree
  }

  return storedSpaceObject
}

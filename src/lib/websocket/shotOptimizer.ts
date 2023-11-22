import type { SpaceObject } from '../interface'

export function spaceObjectUpdateAndShotReciverOptimizer(possibleNewShots: SpaceObject, storedSpaceObject: SpaceObject): SpaceObject {
  if (possibleNewShots.name === storedSpaceObject.name) {
    // Store every previously shots fired
    const cachePhotonLasers = storedSpaceObject.shotsInFlight

    // the new shots
    const newShotsThisUpdate = possibleNewShots.shotsInFlight

    // update the remote player data object
    storedSpaceObject = possibleNewShots

    // concat the old and the new shots
    storedSpaceObject.shotsInFlight = [...cachePhotonLasers, ...newShotsThisUpdate]
  }
  return storedSpaceObject
}

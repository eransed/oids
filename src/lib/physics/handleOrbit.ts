import { SpaceObjectType, type SpaceObject } from '../interface'
import { orbitSpaceObject } from '../mechanics'

export function handleOrbit(spaceObjects: SpaceObject[]) {
  for (const so0 of spaceObjects) {
    if (so0.spaceObjectType === SpaceObjectType.MOON) {
      for (const so1 of spaceObjects) {
        if (so1.spaceObjectType === SpaceObjectType.PLANET) {
          orbitSpaceObject(so0, so1)
        }
      }
    }
  }

  for (const so0 of spaceObjects) {
    if (so0.spaceObjectType === SpaceObjectType.PLAYER) {
      for (const so1 of spaceObjects) {
        if (so1.spaceObjectType === SpaceObjectType.PLANET || SpaceObjectType.MOON) {
          orbitSpaceObject(so0, so1)
        }
      }
    }
  }
}

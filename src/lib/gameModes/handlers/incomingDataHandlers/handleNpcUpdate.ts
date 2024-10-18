import type { SpaceObject } from '../../../interface'

//Checking if the entity (SpaceObject) already exists in reference array, returns boolean
export function exists(so: SpaceObject, spaceObjectsReferences: SpaceObject[]): boolean {
  for (let i = 0; i < spaceObjectsReferences.length; i++) {
    const b = spaceObjectsReferences[i]
    // info(`bname: ${b.name}, ename ${entity.name} equal: ${b.name === entity.name}`)
    if (b.name === so.name) {
      return true
    }
  }
  return false
}

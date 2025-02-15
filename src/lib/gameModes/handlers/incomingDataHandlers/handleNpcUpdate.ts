import { info } from 'mathil'
import type { SpaceObject } from '../../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../../websocket/shotOptimizer'

//Checking if the entity (SpaceObject) already exists in reference array, returns boolean
export function exists(so: SpaceObject, spaceObjectsReferences: SpaceObject[]): boolean {
  for (let i = 0; i < spaceObjectsReferences.length; i++) {
    const b = spaceObjectsReferences[i]
    // info(`bname: ${b.name}, ename ${entity.name} equal: ${b.name === entity.name}`)
    if (b.id === so.id) {
      return true
    }
  }
  return false
}

export function npcUpdate(npcUpdate: { dataObject: SpaceObject }, game: { bodies: SpaceObject[] }): void {
  if (!exists(npcUpdate.dataObject, game.bodies)) {
    info(`Adding ${npcUpdate.dataObject.name}`)
    game.bodies.push(npcUpdate.dataObject)
  } else {
    game.bodies.forEach((b, i) => {
      if (game.bodies[i].id === npcUpdate.dataObject.id) {
        // game.bodies[i] = spaceObjectUpdateAndShotReciverOptimizer(npcUpdate.dataObject, game.bodies[i])
        game.bodies[i] = npcUpdate.dataObject
      }
    })
  }
}

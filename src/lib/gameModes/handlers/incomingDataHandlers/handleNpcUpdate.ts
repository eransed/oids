import { EveryInterval, info } from 'mathil'
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

const evry500 = new EveryInterval(500)

export function npcUpdate(npcUpdate: { dataObject: SpaceObject }, game: { bodies: SpaceObject[] }): void {
  evry500.tick(() => {
    console.log('npc update recieved', npcUpdate.dataObject)
  })
  if (!exists(npcUpdate.dataObject, game.bodies)) {
    info(`Adding ${npcUpdate.dataObject.name}`)
    game.bodies.push(npcUpdate.dataObject)
  } else {
    game.bodies.forEach((b, i) => {
      if (game.bodies[i].name === npcUpdate.dataObject.name) {
        game.bodies[i] = spaceObjectUpdateAndShotReciverOptimizer(npcUpdate.dataObject, game.bodies[i])
      }
    })
  }
}

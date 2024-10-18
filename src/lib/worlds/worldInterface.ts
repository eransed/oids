import { add2, newVec2, rndfVec2, rndi, smul2, type Vec2 } from 'mathil'
import { MessageType, type SpaceObject } from '../interface'
import { createSpaceObject } from '../factory'

export enum Towns {
  Coruscant = 1,
  Tattooine,
  Mayja,
  Alderaan,
  DeathFart,
  Lexxagol,
  Lexby,
}

export interface GameMap {
  towns: SpaceTown[]
}

export interface SpaceTown {
  name: string
  downtownWorldsPosition: Vec2
  buildings: SpaceObject[]
}

export function createWorldOne(): GameMap {
  return {
    towns: [createMainTown()],
  }
}

export function createMainTown(): SpaceTown {
  const pos = newVec2(2342340, 4564560)
  return {
    name: Towns[Towns.Coruscant],
    downtownWorldsPosition: pos,
    buildings: [createBasicBuilding(add2(pos, newVec2(0, 500)))],
  }
}

export function createBasicBuilding(buildingPosition: Vec2): SpaceObject {
  const basicBuilding = createSpaceObject(
    `Building-${rndi(1000, 1000000)}`,
    MessageType.SERVER_GAME_UPDATE
  )
  basicBuilding.ammo = 5000
  basicBuilding.cameraPosition = buildingPosition
  basicBuilding.size = smul2(basicBuilding.size, 3)
  basicBuilding.velocity = rndfVec2(0, 0)
  basicBuilding.hitRadius = Math.sqrt(
    basicBuilding.size.x ** 2 + basicBuilding.size.y ** 2
  )
  basicBuilding.mass = 50
  basicBuilding.health = 5000
  basicBuilding.startHealth = basicBuilding.health
  basicBuilding.photonColor = '#f00'
  basicBuilding.inverseFireRate = 15
  basicBuilding.angularVelocity = 0
  basicBuilding.angleDegree = 90

  return basicBuilding
}

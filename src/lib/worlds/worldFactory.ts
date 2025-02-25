import { add2, newVec2, rndfVec2, rndi, smul2, type Vec2 } from 'mathil'
import { MessageType, SpaceObjectType, type SpaceObject } from '../interface'
import { createMoon, createSpaceObject } from '../factory'
import { Towns, type GameMap, type SpaceTown } from './worldInterface'
import { getPlanets } from './planets'

export function createWorldOne(sessionId: string): GameMap {
  return {
    towns: [createMainTown(sessionId)],
    planets: createMainPlanets(sessionId),
    moons: createMainMoons(sessionId),
  }
}

export function createMainMoons(sessionId: string) {
  let moons = []

  const num = 20
  for (let i = 0; i < num; i++) {
    const moon = createMoon(sessionId)
    moons.push(moon)
  }

  return moons
}

export function createMainPlanets(sessionId: string): SpaceObject[] {
  return getPlanets(sessionId)
}

export function createMainTown(sessionId: string): SpaceTown {
  const pos = newVec2(2342340, 4564560)
  return {
    name: Towns[Towns.Oidstown],
    worldPosition: pos,
    buildings: [createBasicBuilding(add2(pos, newVec2(0, 500)), sessionId)],
  }
}

export function createBasicBuilding(buildingPosition: Vec2, sessionId: string): SpaceObject {
  const basicBuilding = createSpaceObject(`Building-${rndi(1000, 1000000)}`, MessageType.SERVER_GAME_UPDATE)
  basicBuilding.ammo = 5000
  basicBuilding.cameraPosition = buildingPosition
  basicBuilding.size = smul2(basicBuilding.size, 3)
  basicBuilding.velocity = rndfVec2(0, 0)
  basicBuilding.hitRadius = Math.sqrt(basicBuilding.size.x ** 2 + basicBuilding.size.y ** 2)
  basicBuilding.mass = 50
  basicBuilding.health = 5000
  basicBuilding.startHealth = basicBuilding.health
  basicBuilding.photonColor = '#f00'
  basicBuilding.inverseFireRate = 15
  basicBuilding.angularVelocity = 0
  basicBuilding.angleDegree = 90
  basicBuilding.sessionId = sessionId

  return basicBuilding
}

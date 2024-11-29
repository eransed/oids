import { type Vec2 } from 'mathil'
import { type SpaceObject } from '../interface'

export interface BlackHole {
  name: string
  worldPosition: Vec2
  orbitingObjects: SpaceObject[]
}

export enum Towns {
  Lexby,
  Oidstown,
  Lexxagol,
  DeathFart,
}

export interface GameMap {
  towns: SpaceTown[]
  planets: SpaceObject[]
  moons: SpaceObject[]
}

export interface SpaceTown {
  name: string
  worldPosition: Vec2
  buildings: SpaceObject[]
}

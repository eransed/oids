import type { Writable } from "svelte/store"
import type { Vec2d } from "./math"
import type { Steerable } from "./traits/Steerable"

export enum GameType {
  SinglePlayer,
  MultiPlayer,
  WelcomeScreen,
}

export enum MenuEnum {
  Welcome,
  InGame,
  Lobby,
  GameOver,
}

// export interface Game {
//   gameType: GameType
//   canvas: HTMLCanvasElement
//   id: string
//   startedById: string
//   localPlayer: SpaceObject
// }

export enum SpaceShape {
  Comet,
  Moon,
  Planet,
  Star,
  SmallShip,
  XWing,
  YWing,
  Falcon,
  SpaceStation,
}

export interface Shapable {
  shape: SpaceShape
}

export interface Colorable {
  color: string
}

export interface Boostable {
  booster: number
}

export interface Motivated {
  motivatorBroken: boolean
  motivationLevel: number
}

export interface Remote {
  online: boolean
  serverVersion: string
  sessionId: string | undefined
  viewport: Vec2d
}

export interface Local {
  isLocal: boolean
}

export interface Positionable {
  position: Vec2d
}

export interface Physical extends Positionable {
  mass: number
  size: Vec2d
  velocity: Vec2d
  acceleration: Vec2d
}

export interface Rotatable extends Positionable {
  angleDegree: number
  angularVelocity: number
}

export interface Collidable extends Positionable {
  colliding: boolean
  hitRadius: number
}

export interface Thrustable extends Positionable, Physical {
  batteryLevel: number
  enginePower: number
}

export interface Fireable extends Positionable, Physical {
  kills: Set<string>
  killCount: number
  ammo: number
  missileSpeed: number
  missileDamage: number
  canonCoolDown: number
  canonOverHeat: boolean
  canonHeatAddedPerShot: number
  canonCoolDownSpeed: number
  inverseFireRate: number // 1 -> 1 * shotsPerFrame shots/frame
  framesSinceLastShot: number
  shotsPerFrame: number
  photonColor: string
}

export interface Bounceable extends Positionable, Physical {
  bounceCount: number
}

export interface Damager extends Positionable {
  damage: number
  armedDelay: number
  didHit: boolean
  shotBlowFrame: number
  ownerName: string
}

export interface Damageable extends Positionable {
  health: number
  isDead: boolean
  deadFrameCount: number
  obliterated: boolean
  lastDamagedByName: string
  killedByName: string
}

export interface SpaceObject
  extends Shapable,
    Positionable,
    Motivated,
    Remote,
    Local,
    Physical,
    Thrustable,
    Steerable,
    Damager,
    Damageable,
    Fireable,
    Collidable,
    Bounceable,
    Boostable,
    Colorable,
    Player {
  isPlaying: boolean
  framesSinceLastServerUpdate: number
  shotsInFlight: PhotonLaser[]
  shotsInFlightValues: any[]
  shotsFiredThisFrame: boolean
  collidingWith: SpaceObject[]
}

export interface ServerUpdate {
  spaceObjectByteSize: number
  unparsedDataLength: number
  numberOfSpaceObjectKeys: number
  spaceObject: SpaceObject
}

export interface PhotonLaser extends Damager, Physical, Damageable, Rotatable, Colorable {}

export function getRenderableObjectCount(so: SpaceObject): number {
  return 1 + so.shotsInFlight.length + so.collidingWith.length + so.shotsInFlightValues.length
}

// export function applySteer(o: Steerable, deltaTime: number): void {
//   o.angleDegree += o.steeringPower
// }

export interface GameSettings {
  systemGraphs: KeyFunction
  scoreScreen: KeyFunction
  hotKeys: KeyFunction
}

export interface KeyFunctionMap {
  thrust: KeyFunction
  reverseThrust: KeyFunction
  boost: KeyFunction
  halt: KeyFunction
  turnLeft: KeyFunction
  turnRight: KeyFunction
  strafeLeft: KeyFunction
  strafeRight: KeyFunction
  fire: KeyFunction
  reload: KeyFunction
  selfDestroy: KeyFunction
  leaderBoard: KeyFunction
}

export interface KeyFunction {
  activators: string[]
  keyStatus: boolean
  displayText?: string
  store?: Writable<boolean>
}

export interface GameState {
  scoreScreenData: ScoreScreenData
}

export interface ScoreScreenData {
  player: SpaceObject
  remotePlayers: SpaceObject[]
}

export interface Player {
  name: string
}

// export interface CurrentGame {
//   sessionId: string | undefined
//   LeaderBoard: LeaderBoard
// }

// export interface LeaderBoard {
//   players: Player[]
// }

// export interface Player {
//   name: string
//   alive: boolean
//   kills: number
// }

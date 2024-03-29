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

export interface Vec2d {
  x: number
  y: number
}

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
}

export interface Damageable extends Positionable {
  health: number
  isDead: boolean
  deadFrameCount: number
  obliterated: boolean
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
    Colorable {
  isPlaying: boolean
  framesSinceLastServerUpdate: number
  name: string
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

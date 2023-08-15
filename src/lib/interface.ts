import type { Writable } from 'svelte/store'
import type { Vec2d } from 'mathil'
import type { Steerable } from './traits/Steerable'

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
  sessionId: string
  viewport: Vec2d
  joinedGame: string
  // dateTimeClient: Date
  // dateTimeServer: Date
  ping: boolean
  pingResponse: boolean
  pingId: string
  hops: number
  ttl: number
  rtt: number
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
  kills: string[]
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

export interface Chatable {
  lastMessage: string
}

export interface LobbyWaiter {
  readyToPlay: boolean
}

export interface Hoster {
  isHost: boolean
}

export interface Typable {
  messageType: MessageType
}

export enum MessageType {
  GAME_UPDATE = 0,
  SESSION_UPDATE,
  LEFT_SESSION,
  CHAT_MESSAGE,
  PING,
  PING_RESPONSE,
  START_GAME,
  SERVICE,
  SERVER_GAME_UPDATE,
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
    Player,
    Unique,
    Chatable,
    LobbyWaiter,
    Hoster,
    Typable {
  isPlaying: boolean
  framesSinceLastServerUpdate: number
  shotsInFlight: PhotonLaser[]
  shotsInFlightNew: PhotonLaser[]
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
  return 1 + so.shotsInFlight.length + so.collidingWith.length + so.shotsInFlightNew.length
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
  systemGraphs: KeyFunction
  leaderBoard: KeyFunctionStore
  hotKeys: KeyFunctionStore
  shipSettings: KeyFunctionStore
}

export interface KeyFunction {
  activators: string[]
  keyStatus: boolean
  displayText?: string
  toggle?: boolean
}

export interface KeyFunctionStore extends KeyFunction {
  store: Writable<boolean>
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

export interface Unique {
  id: string
}

export interface Session {
  host: SpaceObject
  id: string
  players: SpaceObject[]
}

export interface Route {
  displayText: string
  path: string
  inHeader: boolean
}

export interface ChatMessage {
  message: string
  timeDate: Date
  user: SpaceObject
  serviceMsg?: boolean
}

export interface NonPlayerCharacter extends Damageable, Colorable, Collidable, Physical, Typable {}

import type { Writable } from 'svelte/store'
import { newVec2, type Vec2 } from 'mathil'
import type { Steerable } from './traits/Steerable'
import type { ShipVariant } from '../style/ships'

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

export interface ChosenShip {
  name: string
  level: number
  userId: string
  shipVariant: ShipVariant
  id: string
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

export interface Bounded {
  viewport: Vec2
  viewportScale: number
  worldSize: Vec2
  cameraPosition: Vec2
}

export function boundVec2(): Vec2 {
  return newVec2()
}

export interface Remote {
  framesSinceLastServerUpdate: number
  online: boolean
  isPlaying: boolean
  serverVersion: string
  sessionId: string
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
  position: Vec2
  viewFramePosition: Vec2
}

export interface Physical extends Positionable {
  mass: number
  size: Vec2
  velocity: Vec2
  acceleration: Vec2
}

export interface Rotatable extends Positionable {
  angleDegree: number
  angularVelocity: number
}

export interface Collidable extends Positionable {
  colliding: boolean
  hitRadius: number
  collidingWith: Collidable[]
}

export interface ThrustFlameAtom extends Positionable, Physical {}

export interface Thrustable extends Positionable, Physical {
  batteryLevel: number
  enginePower: number
  thrustFlames: ThrustFlameAtom[]
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
  shotsInFlight: PhotonLaser[]
  shotsInFlightNew: PhotonLaser[]
  shotsFiredThisFrame: boolean
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
  // readonly messageType: MessageType
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

export interface PlayingShip {
  ship: ChosenShip
}

export interface SpaceObject
  extends PlayingShip,
    Shapable,
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
    Nameable,
    Unique,
    Chatable,
    LobbyWaiter,
    Hoster,
    Typable,
    Bounded {}

export interface ServerUpdate<T> {
  spaceObjectByteSize: number
  unparsedDataLength: number
  numberOfSpaceObjectKeys: number
  dataObject: T
}

export interface Ageable {
  age: number
}

export interface PhotonLaser extends Damager, Physical, Damageable, Rotatable, Colorable, Ageable {}

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

export interface TouchFunctionMap {
  thrust: boolean
  menu: boolean
  reverseThrust: boolean
  // boost: boolean
  // halt: boolean
  // turnLeft: boolean
  // turnRight: boolean
  // strafeLeft: boolean
  // strafeRight: boolean
  fire: boolean
  // reload: boolean
  // selfDestroy: boolean
  // systemGraphs: boolean
  // leaderBoard: boolean
  // hotKeys: boolean
  // shipSettings: boolean
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

export interface Nameable {
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
  icon: string
}

export interface ChatMessage {
  message: string
  timeDate: Date
  user: SpaceObject
  serviceMsg?: boolean
}

export interface NonPlayerCharacter extends Damageable, Colorable, Collidable, Physical, Typable, Rotatable, Bounceable, Damager, Nameable, Fireable, Bounded {}

export interface ShipUpgrades {
  hyperdrive: boolean
  photonLaserPower: number
  hullStrength: number
  shieldStrength: number
  engineStrength: number
  maxEnergyLevel: number
  steeringPower: number
}

export interface CoreProps {
  energyLevel: number // boost engine, shields and cannons. can be
}

import { newVec2, type Vec2 } from 'mathil'
import type { Steerable } from './traits/Steerable'
import type { ShipVariant } from '../style/ships'
import type { Towns } from './worlds/worldInterface'

export enum GameMode {
  SPACE_MODE,
  ARCADE_MODE,
}

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

//ToDo: Primary and secondary weapon for SpaceObject
// and available weapons from inventory
export enum Weapon {
  FortyWattPlasmaCannon,
  IonCannon,
  SuperLaserArray,
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

export interface MoonType {
  moonType: number
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
  experience: number
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
  cameraVelocity: Vec2
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

export interface Crashable {
  crashed: boolean
}

export interface Landable {
  // Stepable, Oribitable, Planetable, Groundable, Terrable, Globeable (Capable of being landed)
  // You are so freaking landable!!
  characterGlobalPosition: Vec2
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
  batteryCapacity: number
  enginePower: number
  afterBurner: boolean
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

export interface Traceable extends Positionable {
  positionalTrace: SpaceObject[] | null
  ticksSinceLastSnapShot: number
}

export interface Damageable extends Positionable {
  health: number
  startHealth: number
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
  SHIP_UPDATE,
}

export interface PlayingShip {
  ship: ChosenShip
}

export interface Belonging {
  hometown: Towns
}

export interface Jumpable {
  isJumping: boolean
}

export interface GameModable {
  gameMode: GameMode
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
    Bounded,
    MoonType,
    Belonging,
    Traceable,
    Landable,
    Jumpable,
    GameModable {}

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

export interface KeyMapManager {
  getDefault: () => KeyFunctionMap
  resetKeyMap: () => void
  setKeyMap: (map: KeyFunctionMap) => void
  getKeyMap: () => KeyFunctionMap
}

export interface KeyFunctionMap {
  name: string
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
  shipDetails: KeyFunctionStore
  chat: KeyFunctionStore
  menu: KeyFunctionStore
  jump: KeyFunctionStore
  changeMode: KeyFunctionStore
  tractorBeam: KeyFunctionStore
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
  displayText: string
  toggle?: boolean
}

export interface KeyFunctionStore extends KeyFunction {
  store: boolean
}

export interface GameState {
  scoreScreenData: ScoreScreenData
}

export interface ScoreScreenData {
  player: SpaceObject
  remotePlayers: SpaceObject[]
  serverObjects: SpaceObject[]
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
  icon?: string
}

export interface ChatMessage {
  message: string
  timeDate: Date
  user: SpaceObject
  serviceMsg?: boolean
}

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

export interface Crater {
  x: number
  y: number
  radius: number
  color: string
}

export interface Settings {
  uiStyle: UIStyle
  theme: Theme
}

export interface UIStyle {
  unarmedShotColor: string
  armedShotColor: string
  shipColor: string
  spaceColor: string
  starColor: string
}

export interface Theme {
  name: string
  bg: string
  card: string
  text: string
  accent: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface Button90Config {
  buttonText: string
  clickCallback: () => void
  selected: boolean
  routeParam?: string
}

//Extracted from prisma types
export interface Ship {
  id: string
  level: number
  name: string
  updatedAt: Date
  createdAt: Date
  experience: number
  userId: string
  variant: number
  played: number
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
  role: string
  theme: number
  image: string
  played: number
  ships: Ship[]
  gameHistory: Game[]
}

export interface Game {
  id: number
  sessionId: string
  win: boolean
  played: Date
  userId: string | null
}

export interface Star {
  position: Vec2
  speedFactor: number
  size: number
}

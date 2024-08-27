import type { PhotonLaser, SpaceObject } from './interface'
import { MessageType, SpaceShape } from './interface'
import { newVec2, rndf, rndi, type Vec2 } from 'mathil'
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'
// import type { Ship } from '@prisma/client'
import type { Ship } from './interface'
import { Towns } from './worlds/worldInterface'
import { groundLevel } from './physics/physics'
import { GameMode } from './game'

export function newPhotonLaser(): PhotonLaser {
  const shot: PhotonLaser = {
    acceleration: { x: 0, y: 0 },
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 50,
    color: '#90d',
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    health: 100,
    startHealth: 100,
    isDead: false,
    mass: 1,
    obliterated: false,
    position: { x: 0, y: 0 },
    shotBlowFrame: 16,
    size: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    ownerName: '',
    lastDamagedByName: '',
    killedByName: '',
    viewFramePosition: newVec2(),
    age: 0,
  }

  return shot
}

export function currentTimeDate(): string {
  return new Date().toLocaleString('sv-SE')
}

export function createSpaceObject(
  name = 'SpaceObject',
  msgType = MessageType.GAME_UPDATE
): SpaceObject {
  const initVel: Vec2 = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2 = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    afterBurner: false,
    messageType: msgType,
    viewport: { x: 0, y: 0 },
    viewportScale: 1,
    sessionId: '',
    acceleration: { x: 0, y: 0 },
    ammo: 1000,
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 500,
    batteryLevel: 500,
    batteryCapacity: 500,
    booster: 2,
    bounceCount: 0,
    canonCoolDown: 0,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 1.7,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    color: '#db8',
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    enginePower: 0.2,
    framesSinceLastServerUpdate: 0,
    framesSinceLastShot: 0,
    health: 100,
    startHealth: 100,
    hitRadius: 60,
    inverseFireRate: 6,
    isDead: false,
    isLocal: false,
    isPlaying: false,
    killedByName: '',
    kills: [],
    killCount: 0,
    mass: 1,
    missileDamage: 10,
    missileSpeed: 20,
    motivationLevel: 100,
    motivatorBroken: false,
    name: name,
    id: rndi(1, 500000).toString(),
    obliterated: false,
    online: false,
    photonColor: '#f00',
    position: initPos,
    positionalTrace: [],
    serverVersion: '',
    shape: SpaceShape.SmallShip,
    shotBlowFrame: 16,
    shotsInFlight: [],
    shotsInFlightNew: [],
    shotsFiredThisFrame: false,
    shotsPerFrame: 1,
    size: { x: 50, y: 50 },
    // steer: function (direction: number, deltaTime: number): void {
    //  throw new Error('Steer not implemented.')
    // },
    steeringPower: 1.2,
    velocity: initVel,
    ownerName: '',
    lastDamagedByName: '',
    joinedGame: currentTimeDate(),
    lastMessage: '',
    readyToPlay: false,
    isHost: false,
    // dateTimeClient: undefined,
    // dateTimeServer: undefined,
    ping: false,
    pingResponse: false,
    pingId: '',
    hops: 0,
    ttl: 0,
    rtt: 0,
    worldSize: newVec2(),
    cameraPosition: newVec2(),
    cameraVelocity: newVec2(),
    viewFramePosition: newVec2(),
    thrustFlames: [],
    ship: {
      name: '',
      level: 0,
      userId: '',
      shipVariant: 0,
      id: '',
      experience: 0,
    },
    moonType: 0,
    hometown: Towns.Coruscant,
    ticksSinceLastSnapShot: 0,
    characterGlobalPosition: newVec2(500, groundLevel),
    isJumping: false,
    gameMode: GameMode.SPACE_MODE
  }

  spaceObject.hitRadius = Math.sqrt(
    spaceObject.size.x ** 2 + spaceObject.size.y ** 2
  )

  return spaceObject
}

export function createShip(userId: string): Ship {
  const ship: Ship = {
    id: '', //No need of creating an unique id since API endpoint makes this
    createdAt: new Date(),
    updatedAt: new Date(),
    variant: 0,
    name: '',
    userId: userId,
    level: 1,
    experience: 1,
    played: 0,
  }

  return ship
}

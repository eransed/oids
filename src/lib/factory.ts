import type { PhotonLaser, SpaceObject } from './interface'
import { MessageType, SpaceShape } from './interface'
import { mag2, magnitude2, newVec2, rndf, rndfVec2, rndi, type Vec2 } from 'mathil'
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'
import { randomBlue } from './color'
import type { Ship } from '@prisma/client'

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

export function createSpaceObject(name = 'SpaceObject', msgType = MessageType.GAME_UPDATE): SpaceObject {
  const initVel: Vec2 = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2 = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
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
    booster: 2,
    bounceCount: 0,
    canonCoolDown: 0,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 1.7,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    color: '#90d',
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
    missileDamage: 2,
    missileSpeed: 20,
    motivationLevel: 100,
    motivatorBroken: false,
    name: name,
    id: rndi(1, 500000).toString(),
    obliterated: false,
    online: false,
    photonColor: '#0f0',
    position: initPos,
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
  }

  spaceObject.hitRadius = Math.sqrt(spaceObject.size.x ** 2 + spaceObject.size.y ** 2)

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

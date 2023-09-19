import type { NonPlayerCharacter, PhotonLaser, SpaceObject } from './interface'
import { MessageType, SpaceShape } from './interface'
import { newVec2, rndf, rndfVec2, rndi, type Vec2 } from 'mathil'
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'
import { randomBlue } from './color'

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
  }

  return shot
}

export function currentTimeDate(): string {
  return new Date().toLocaleString('sv-SE')
}

export function createSpaceObject(name = 'SpaceObject'): SpaceObject {
  const initVel: Vec2 = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2 = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    messageType: MessageType.GAME_UPDATE,
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
    id: rndi(1, 500).toString(),
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
    size: { x: 100, y: 100 },
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
    viewFramePosition: newVec2(),
  }

  return spaceObject
}

export function createNpc(): NonPlayerCharacter {
  const npc: NonPlayerCharacter = {
    health: 100,
    isDead: false,
    deadFrameCount: 0,
    obliterated: false,
    lastDamagedByName: '',
    killedByName: '',
    position: rndfVec2(100, 2000),
    color: randomBlue(),
    colliding: false,
    hitRadius: 100,
    mass: 1,
    size: rndfVec2(50, 100),
    velocity: rndfVec2(0.5, 1),
    acceleration: newVec2(),
    viewport: newVec2(1200, 720),
    viewportScale: 1,
    messageType: MessageType.SERVER_GAME_UPDATE,
    angleDegree: 0,
    angularVelocity: 1,
    collidingWith: [],
    bounceCount: 0,
    damage: 0,
    armedDelay: 0,
    didHit: false,
    shotBlowFrame: 0,
    ownerName: '',
    name: `A-${rndi(10000, 100000000)}`,
    // name: `A-${rndi(100000, 100000000)}`,
    kills: [],
    killCount: 0,
    ammo: 0,
    missileSpeed: 0,
    missileDamage: 0,
    canonCoolDown: 0,
    canonOverHeat: false,
    canonHeatAddedPerShot: 0,
    canonCoolDownSpeed: 0,
    inverseFireRate: 0,
    framesSinceLastShot: 0,
    shotsPerFrame: 0,
    photonColor: '',
    shotsInFlight: [],
    shotsInFlightNew: [],
    shotsFiredThisFrame: false,
    worldSize: newVec2(),
    cameraPosition: newVec2(),
    viewFramePosition: newVec2(),
  }
  return npc
}
undefined

import type { PhotonLaser, SpaceObject } from './interface'
import { MessageType, PlanetType, SpaceObjectType, SpaceRelation, SpaceShape } from './interface'
import { add2, newVec2, rndf, rndfVec2, rndi, smul2, type Vec2 } from 'mathil'
import { maxRandomDefaultSpaceObjectVelocity as maxVel, orbitingScale, worldStartPosition } from './constants'
// import type { Ship } from '@prisma/client'
import type { Ship } from './interface'
import { Towns } from './worlds/worldInterface'
import { calculateMass, calculateRadius, getRemotePosition, getWorldCoordinates, groundLevel } from './physics/physics'
import { GameMode } from './interface'

export function newPhotonLaser(): PhotonLaser {
  const shot: PhotonLaser = {
    acceleration: { x: 0, y: 0 },
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 5000,
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
    orbitingAltitude: 0,
  }

  return shot
}

export function currentTimeDate(): string {
  return new Date().toLocaleString('sv-SE')
}

export function createPlanet(sessionId: string, pos: Vec2, size: Vec2, name?: string) {
  const randomName = rndi(1, 100000)

  const planet = createSpaceObject(`Planet-${name ?? randomName}`, MessageType.SERVER_GAME_UPDATE)
  planet.sessionId = sessionId
  // planet.ammo = 5000

  // planet.cameraPosition = rndfVec2(pos.x, pos.y)
  planet.cameraPosition = pos
  planet.size = size
  // planet.velocity = rndfVec2(0.1, 0.3)
  planet.hitRadius = calculateRadius(planet.size)
  planet.orbitingAltitude = orbitingScale * planet.hitRadius
  planet.mass = calculateMass(planet.size)
  planet.health = 50
  planet.startHealth = planet.health
  planet.photonColor = '#f00'
  planet.inverseFireRate = 15
  // planet.angularVelocity = 0.001
  planet.angleDegree = 90
  planet.spaceObjectType = SpaceObjectType.PLANET

  return planet
}

export function createCompanionShip(sessionId: string, clientName: string, createrSo: SpaceObject, pos?: Vec2) {
  const companionShip = createSpaceObject(`companion-${rndi(1, 10000)}`, MessageType.SERVER_GAME_UPDATE)
  companionShip.sessionId = sessionId
  companionShip.ammo = 5000
  companionShip.spaceObjectType = SpaceObjectType.SHIP
  companionShip.relation = SpaceRelation.COMPANION
  companionShip.owner = clientName

  // enemyShip.size = smul2(enemyShip.size, rndi(3, 15))
  companionShip.velocity = createrSo.velocity
  companionShip.hitRadius = Math.sqrt(companionShip.size.x ** 2 + companionShip.size.y ** 2)
  // enemyShip.mass = calculateMass(enemyShip.size)
  companionShip.health = 50
  companionShip.startHealth = companionShip.health
  companionShip.photonColor = '#f00'
  companionShip.inverseFireRate = 15
  companionShip.angularVelocity = 0.001
  companionShip.angleDegree = createrSo.angleDegree
  companionShip.ship.variant = 2
  companionShip.armedDelay = 10

  companionShip.cameraPosition = add2(getWorldCoordinates(createrSo), newVec2(0, 500))

  return companionShip
}

export function createEnemyShip(sessionId: string, pos?: Vec2) {
  const enemyShip = createSpaceObject(`enemy-${rndi(1, 10000)}`, MessageType.SERVER_GAME_UPDATE)
  enemyShip.sessionId = sessionId
  enemyShip.ammo = 5000
  enemyShip.spaceObjectType = SpaceObjectType.SHIP
  enemyShip.relation = SpaceRelation.ENEMY

  // enemyShip.size = smul2(enemyShip.size, rndi(3, 15))
  enemyShip.velocity = rndfVec2(0.1, 0.3)
  enemyShip.hitRadius = Math.sqrt(enemyShip.size.x ** 2 + enemyShip.size.y ** 2)
  // enemyShip.mass = calculateMass(enemyShip.size)
  enemyShip.health = 50
  enemyShip.startHealth = enemyShip.health
  enemyShip.photonColor = '#f00'
  enemyShip.inverseFireRate = 15
  enemyShip.angularVelocity = 0.001
  enemyShip.angleDegree = 90
  enemyShip.ship.variant = 3
  enemyShip.armedDelay = 10

  if (pos) {
    enemyShip.cameraPosition = rndfVec2(pos.x - 5000, pos.y + 5000)
  } else {
    enemyShip.cameraPosition = rndfVec2(worldStartPosition.x - 10000, worldStartPosition.y + 10000)
  }

  return enemyShip
}

export function createMoon(sessionId: string, pos?: Vec2) {
  const moon = createSpaceObject(`A-${rndi(1000, 1000000)}`, MessageType.SERVER_GAME_UPDATE)
  moon.sessionId = sessionId
  moon.ammo = 5000
  if (pos) {
    moon.cameraPosition = rndfVec2(pos.x - 500, pos.y + 1750)
  } else {
    moon.cameraPosition = rndfVec2(worldStartPosition.x - 20000, worldStartPosition.y + 20000)
  }
  moon.size = smul2(moon.size, rndi(3, 15))
  moon.velocity = rndfVec2(0.1, 0.3)
  moon.hitRadius = Math.sqrt(moon.size.x ** 2 + moon.size.y ** 2)
  moon.orbitingAltitude = orbitingScale * moon.hitRadius
  moon.mass = calculateMass(moon.size)
  moon.health = 50
  moon.startHealth = moon.health
  moon.photonColor = '#f00'
  moon.inverseFireRate = 15
  moon.angularVelocity = 0.001
  moon.angleDegree = 90
  moon.spaceObjectType = SpaceObjectType.MOON
  //TODO: Make moontype an enum instead
  moon.moonType = rndi(0, 3)

  return moon
}

export function createSpaceObject(name = 'SpaceObject', msgType = MessageType.GAME_UPDATE): SpaceObject {
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
    ammo: 10000,
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 10,
    batteryLevel: 10000,
    batteryCapacity: 10000,
    booster: 2,
    bounceCount: 0,
    canonCoolDown: 0,
    canonCoolDownSpeed: 10,
    canonHeatAddedPerShot: 1.7,
    canonOverHeat: false,
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
    id: rndi(1, 5000000),
    obliterated: false,
    online: true,
    photonColor: '#f00',
    position: initPos,
    // positionalTrace: [],
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
    splittedNrOfTimes: 0,
    velocity: initVel,
    ownerName: '',
    lastDamagedByName: '',
    joinedGame: currentTimeDate(),
    lastMessage: '',
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
      id: name,
      level: 0,
      name: name,
      updatedAt: new Date(),
      createdAt: new Date(),
      experience: 0,
      userId: '',
      variant: 0,
      played: 0,
    },
    moonType: 0,
    hometown: Towns.Oidstown,
    ticksSinceLastSnapShot: 0,
    characterGlobalPosition: newVec2(500, groundLevel),
    isJumping: false,
    gameMode: GameMode.SPACE_MODE,
    dt: 0,
    spaceObjectType: SpaceObjectType.PLAYER,
    relation: SpaceRelation.FRIENDLY,
    owner: '',
    orbitingAltitude: 0,
    planetType: PlanetType.ICE,
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

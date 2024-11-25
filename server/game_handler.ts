import { info, usNow, rndfVec2, good, newVec2, rndi, smul2, dist2, angle2, sub2, rndf, warn } from 'mathil'
import { MessageType, SpaceObject, SpaceObjectType } from '../src/lib/interface'

import { Client, globalConnectedClients } from './main'
import { worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'
import { createSpaceObject } from '../src/lib/factory'
import { fire, removeOblitiratedSpaceObjects } from '../src/lib/mechanics'
import { getWorldCoordinates, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics/physics'
import { handleCollisions } from '../src/lib/physics/handleCollisions'
import { GameMap, createWorldOne } from '../src/lib/worlds/worldInterface'
import { stdout } from 'process'

export class GameHandler {
  game_started = false
  asteroids: SpaceObject[] = []
  game_interval: NodeJS.Timeout | undefined = undefined
  start_time_us: number = usNow()
  tied_session_id: string

  // private readonly tickRate = 30
  private readonly fps = 60
  private remoteSpaceObjects: SpaceObject[] = []
  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1 / this.fps
  // private every = new EveryInterval(this.tickRate)
  // private asteroidTicker = new EveryInterval(this.tickRate)
  private nextAsteroidToSendIndex = 0
  private gameMap: GameMap | undefined = undefined
  private sentOnce = false // only used during dev...

  broadcaster: (clients: Client[], data: SpaceObject, sessionId: string | null) => void

  constructor(bc: (clients: Client[], data: SpaceObject, sessionId: string | null) => void, sessionId: string) {
    this.broadcaster = bc
    this.tied_session_id = sessionId
  }

  quit_game(): void {
    info(`Quitting game ${this.tied_session_id}`)
    this.game_started = false
    this.asteroids = []
    clearInterval(this.game_interval)
  }

  game_session_start() {
    this.gameMap = createWorldOne(this.tied_session_id)

    info(`Starting game ${this.tied_session_id} and creating asteroids...`)
    this.game_started = true
    this.spawnAsteroids()

    // Server main loop:
    this.game_interval = setInterval(() => {
      this.dt = performance.now() - this.lastTime

      // process.stdout.write(`${this.remoteSpaceObjects.length}`)

      this.asteroids = removeOblitiratedSpaceObjects(this.asteroids)
      this.remoteSpaceObjects = removeOblitiratedSpaceObjects(this.remoteSpaceObjects)

      for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
        this.remoteSpaceObjects[i] = updateSpaceObject(this.remoteSpaceObjects[i], this.dt)
      }

      // this.remoteSpaceObjects.forEach((so) => {
      //   if (so.shotsInFlight.length > 0) {
      //     console.log('Shots in flight!', so.shotsInFlight)
      //   }
      // })

      this.checkHittingShots()
      // Game logic for asteroids:
      for (let i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i] = updateSpaceObject(this.asteroids[i], this.dt)
      }

      for (let i = 0; i < this.asteroids.length; i++) {
        for (let j = 0; j < this.remoteSpaceObjects.length; j++) {
          if (this.asteroids[i].lastDamagedByName === this.remoteSpaceObjects[j].name) {
            const angleToShip = angle2(sub2(getWorldCoordinates(this.remoteSpaceObjects[j]), getWorldCoordinates(this.asteroids[i])))
            this.asteroids[i].angleDegree = rndf(0, 0) + angleToShip
            if (dist2(getWorldCoordinates(this.asteroids[i]), getWorldCoordinates(this.remoteSpaceObjects[j])) < 1200) {
              // info(`Aster ${this.asteroids[i].name} shots at ${this.remoteSpaceObjects[j].name}`)
              // info(`ATS: ${angleToShip} deg`)
              this.asteroids[i].armedDelay = 0
              fire(this.asteroids[i])
            } else {
              this.asteroids[i].lastDamagedByName = ''
            }
          }
        }
      }

      const obj = this.asteroids[this.nextAsteroidToSendIndex]
      if (obj) {
        this.asteroids[this.nextAsteroidToSendIndex] = this.prepareSoToSend(obj)
        this.asteroids[this.nextAsteroidToSendIndex].collidingWith = []
        this.broadcaster(globalConnectedClients, this.asteroids[this.nextAsteroidToSendIndex], this.tied_session_id)
        this.nextAsteroidToSendIndex++
        if (this.nextAsteroidToSendIndex >= this.asteroids.length) {
          this.nextAsteroidToSendIndex = 0
        }
      } else {
        // warn('oh shit')
        // console.log("nextAsteroidToSendIndex", this.nextAsteroidToSendIndex, this.asteroids)
      }

      // Send town updates if there are any:
      this.updateTownsIfApplicable()

      this.lastTime = performance.now()
    }, this.minTickTimeMs)
  }
  // server main loop end

  updateTownsIfApplicable() {
    if (!this.gameMap) {
      warn('No gameMap initialiazed')
      return
    }
    // if (!force) {
    //   if (this.sentOnce === true) return
    //   this.sentOnce = true
    // }

    // info(`Broadcasting town...`)

    for (let i = 0; i < this.gameMap.towns.length; i++) {
      for (let j = 0; j < this.gameMap.towns[i].buildings.length; j++) {
        const building = this.gameMap.towns[i].buildings[j]
        // info(`Broadcasting building: ${building.name}`)
        // info(`Broadcasting building speedx: ${building.velocity.x}`)
        // info(`Broadcasting building speedy: ${building.velocity.y}`)
        this.broadcaster(globalConnectedClients, building, this.tied_session_id)
      }
    }

    // broadcast world:
  }

  prepareSoToSend(so: SpaceObject): SpaceObject {
    so.shotsFiredThisFrame = false
    so.shotsInFlight = []
    if (so.shotsInFlightNew.length > 0) {
      so.shotsInFlight = so.shotsInFlightNew
    }
    so.shotsInFlightNew = []
    return so
  }

  spawnAsteroids(): SpaceObject[] {
    const num = 10
    info(`Creating ${num} asteroids`)
    for (let i = 0; i < num; i++) {
      const npc = createSpaceObject(`A-${rndi(1000, 1000000)}`, MessageType.SERVER_GAME_UPDATE)
      npc.sessionId = this.tied_session_id
      npc.ammo = 5000
      npc.cameraPosition = rndfVec2(worldStartPosition.x - 2000, worldStartPosition.y + 5000)
      npc.size = smul2(npc.size, rndi(3, 15))
      npc.velocity = rndfVec2(0.1, 0.3)
      npc.hitRadius = Math.sqrt(npc.size.x ** 2 + npc.size.y ** 2)
      npc.mass = 50
      npc.health = 50
      npc.startHealth = npc.health
      npc.photonColor = '#f00'
      npc.inverseFireRate = 15
      npc.angularVelocity = 0.001
      npc.angleDegree = 90
      npc.spaceObjectType = SpaceObjectType.ASTEROID
      //TODO: Make moontype an enum instead
      npc.moonType = rndi(0, 3)
      this.asteroids.push(npc)
    }
    return this.asteroids
  }

  handleSpaceObjectUpdate(so: SpaceObject) {
    // console.log('update from: ', so.name)
    for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
      this.remoteSpaceObjects[i] = spaceObjectUpdateAndShotReciverOptimizer(so, this.remoteSpaceObjects[i])
    }
    this.addNewSpaceObjects(so)
  }

  removeSpaceObject(so: SpaceObject) {
    this.remoteSpaceObjects = this.remoteSpaceObjects.filter((v) => v.name !== so.name)
  }

  addNewSpaceObjects(so: SpaceObject) {
    if (so.isDead) {
      return
    }

    for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
      if (this.remoteSpaceObjects[i].name === so.name) {
        return
      }
    }
    good(`Adding ${so.name} in remote list`)

    this.remoteSpaceObjects.push(so)
    for (let i = 0; i < 0; i++) {
      this.broadcaster(globalConnectedClients, this.asteroids[i], this.tied_session_id)
    }
  }

  // never called this method... gah.
  checkHittingShots() {
    const spaceObjects = [...this.asteroids, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

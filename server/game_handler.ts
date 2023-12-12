import { info, usNow, EveryInterval, rndfVec2, good, newVec2, rndi, smul2, dist2, radToDeg, angle2, sub2, rndf } from 'mathil'
import { MessageType, SpaceObject } from '../src/lib/interface'
import { getHeading, getWorldCoordinates, handleCollisions, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics'
import { Client, globalConnectedClients } from './main'
import { worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'
import { createSpaceObject } from '../src/lib/factory'
import { fire, removeOblitiratedSpaceObjects } from '../src/lib/mechanics'

export class GameHandler {
  game_started = false
  asteroids: SpaceObject[] = []
  game_interval: NodeJS.Timer | undefined = undefined
  start_time_us: number = usNow()
  tied_session_id: string | null = null

  // private readonly tickRate = 30
  private readonly fps = 30
  private remoteSpaceObjects: SpaceObject[] = []
  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1 / this.fps
  // private every = new EveryInterval(this.tickRate)
  // private asteroidTicker = new EveryInterval(this.tickRate)
  private nextAsteroidToSendIndex = 0

  broadcaster: (clients: Client[], data: SpaceObject, sessionId: string | null) => void

  constructor(bc: (clients: Client[], data: SpaceObject, sessionId: string | null) => void) {
    this.broadcaster = bc
  }

  quit_game(): void {
    info(`Quitting game ${this.tied_session_id}`)
    this.game_started = false
    this.asteroids = []
    clearInterval(this.game_interval)
  }

  game_session_start(sessionId: string) {
    info(`Starting game ${sessionId} and creating asteroids...`)
    this.tied_session_id = sessionId
    this.game_started = true
    this.spawnAsteroids()

    // Server main loop:
    this.game_interval = setInterval(() => {
      this.dt = performance.now() - this.lastTime

      this.asteroids = removeOblitiratedSpaceObjects(this.asteroids)
      this.remoteSpaceObjects = removeOblitiratedSpaceObjects(this.remoteSpaceObjects)
      updateSpaceObjects(this.remoteSpaceObjects, this.dt)

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

      this.asteroids[this.nextAsteroidToSendIndex] = this.prepareSoToSend(this.asteroids[this.nextAsteroidToSendIndex])
      this.asteroids[this.nextAsteroidToSendIndex].collidingWith = []
      this.broadcaster(globalConnectedClients, this.asteroids[this.nextAsteroidToSendIndex], sessionId)
      this.nextAsteroidToSendIndex++
      if (this.nextAsteroidToSendIndex >= this.asteroids.length) {
        this.nextAsteroidToSendIndex = 0
      }

      this.lastTime = performance.now()
    }, this.minTickTimeMs)
  }
  // server main loop end

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
    const num = 30
    info(`Creating ${num} asteroids`)
    for (let i = 0; i < num; i++) {
      const npc = createSpaceObject(`A-${rndi(1000, 1000000)}`, MessageType.SERVER_GAME_UPDATE)
      npc.ammo = 5000
      npc.cameraPosition = rndfVec2(worldStartPosition.x - 2000, worldStartPosition.y + 5000)
      npc.size = smul2(npc.size, 3)
      npc.velocity = rndfVec2(0.1, 0.3)
      npc.hitRadius = Math.sqrt(npc.size.x ** 2 + npc.size.y ** 2)
      npc.mass = 50
      npc.health = 500
      npc.startHealth = npc.health
      npc.photonColor = '#f00'
      npc.inverseFireRate = 15
      npc.angularVelocity = 0.001
      npc.angleDegree = 90
      this.asteroids.push(npc)
    }
    return this.asteroids
  }

  handleSpaceObjectUpdate(so: SpaceObject) {
    for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
      this.remoteSpaceObjects[i] = spaceObjectUpdateAndShotReciverOptimizer(so, this.remoteSpaceObjects[i])
    }
    this.addNewSpaceObjects(so)
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
  }

  // never called this method... gah.
  checkHittingShots() {
    const spaceObjects = [...this.asteroids, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

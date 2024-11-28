import { info, usNow, rndfVec2, good, newVec2, rndi, smul2, dist2, angle2, sub2, rndf, warn } from 'mathil'
import { MessageType, SpaceObject, SpaceObjectType } from '../src/lib/interface'

import { Client, globalConnectedClients } from './main'
import { worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'
import { createMoon, createSpaceObject } from '../src/lib/factory'
import { fire, removeOblitiratedSpaceObjects } from '../src/lib/mechanics'
import { getWorldCoordinates, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics/physics'
import { handleCollisions } from '../src/lib/physics/handleCollisions'
import { GameMap, createWorldOne } from '../src/lib/worlds/worldInterface'
import { stdout } from 'process'

export class GameHandler {
  game_started = false
  moons: SpaceObject[] = []
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
  private nextMoonToSendIndex = 0
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
    this.moons = []
    clearInterval(this.game_interval)
  }

  game_session_start() {
    this.gameMap = createWorldOne(this.tied_session_id)

    info(`Starting game ${this.tied_session_id} and creating moons...`)
    this.game_started = true
    this.spawnMoons()

    // Server main loop:
    this.game_interval = setInterval(() => {
      this.dt = performance.now() - this.lastTime

      // process.stdout.write(`${this.remoteSpaceObjects.length}`)

      this.moons = removeOblitiratedSpaceObjects(this.moons)
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
      // Game logic for npcs:
      for (let i = 0; i < this.moons.length; i++) {
        this.moons[i] = updateSpaceObject(this.moons[i], this.dt)
      }

      for (let i = 0; i < this.moons.length; i++) {
        for (let j = 0; j < this.remoteSpaceObjects.length; j++) {
          if (this.moons[i].lastDamagedByName === this.remoteSpaceObjects[j].name) {
            const angleToShip = angle2(sub2(getWorldCoordinates(this.remoteSpaceObjects[j]), getWorldCoordinates(this.moons[i])))
            this.moons[i].angleDegree = rndf(0, 0) + angleToShip
            if (dist2(getWorldCoordinates(this.moons[i]), getWorldCoordinates(this.remoteSpaceObjects[j])) < 1200) {
              // info(`Aster ${this.moons[i].name} shots at ${this.remoteSpaceObjects[j].name}`)
              // info(`ATS: ${angleToShip} deg`)
              this.moons[i].armedDelay = 0
              fire(this.moons[i])
            } else {
              this.moons[i].lastDamagedByName = ''
            }
          }
        }
      }

      const obj = this.moons[this.nextMoonToSendIndex]
      if (obj) {
        this.moons[this.nextMoonToSendIndex] = this.prepareSoToSend(obj)
        this.moons[this.nextMoonToSendIndex].collidingWith = []
        this.broadcaster(globalConnectedClients, this.moons[this.nextMoonToSendIndex], this.tied_session_id)
        this.nextMoonToSendIndex++
        if (this.nextMoonToSendIndex >= this.moons.length) {
          this.nextMoonToSendIndex = 0
        }
      } else {
        // warn('oh shit')
        // console.log("nextAsteroidToSendIndex", this.nextAsteroidToSendIndex, this.moons)
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

  spawnMoons(): SpaceObject[] {
    const num = 10
    info(`Creating ${num} moons`)
    for (let i = 0; i < num; i++) {
      const moon = createMoon(this.tied_session_id)
      this.moons.push(moon)
    }
    return this.moons
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
      this.broadcaster(globalConnectedClients, this.moons[i], this.tied_session_id)
    }
  }

  // never called this method... gah.
  checkHittingShots() {
    const spaceObjects = [...this.moons, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

import { info, usNow, rndfVec2, good, newVec2, rndi, smul2, dist2, angle2, sub2, rndf, warn } from 'mathil'
import { MessageType, SpaceObject, SpaceObjectType } from '../src/lib/interface'

import { Client, globalConnectedClients } from './main'
import { worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'
import { createEnemyShip, createMoon, createSpaceObject } from '../src/lib/factory'
import { fire, removeOblitiratedSpaceObjects } from '../src/lib/mechanics'
import { getWorldCoordinates, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics/physics'
import { handleCollisions } from '../src/lib/physics/handleCollisions'
import { GameMap } from '../src/lib/worlds/worldInterface'
import { createWorldOne } from '../src/lib/worlds/worldFactory'

export class GameHandler {
  game_started = false
  worldSpaceObjects: SpaceObject[] = []
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
  private nextWorldObjectToSendIndex = 0
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
    this.worldSpaceObjects = []
    clearInterval(this.game_interval)
  }

  game_session_start() {
    this.gameMap = createWorldOne(this.tied_session_id)

    info(`Starting game ${this.tied_session_id} and creating world...`)
    this.game_started = true

    this.setWorldSpaceObjects()

    // Server main loop:
    this.game_interval = setInterval(() => {
      this.dt = performance.now() - this.lastTime

      // process.stdout.write(`${this.remoteSpaceObjects.length}`)

      this.worldSpaceObjects = removeOblitiratedSpaceObjects(this.worldSpaceObjects)
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
      for (let i = 0; i < this.worldSpaceObjects.length; i++) {
        this.worldSpaceObjects[i] = updateSpaceObject(this.worldSpaceObjects[i], this.dt)
      }

      for (let i = 0; i < this.worldSpaceObjects.length; i++) {
        for (let j = 0; j < this.remoteSpaceObjects.length; j++) {
          if (this.worldSpaceObjects[i].lastDamagedByName === this.remoteSpaceObjects[j].name) {
            const angleToShip = angle2(sub2(getWorldCoordinates(this.remoteSpaceObjects[j]), getWorldCoordinates(this.worldSpaceObjects[i])))
            this.worldSpaceObjects[i].angleDegree = rndf(0, 0) + angleToShip
            if (dist2(getWorldCoordinates(this.worldSpaceObjects[i]), getWorldCoordinates(this.remoteSpaceObjects[j])) < 1200) {
              // info(`Aster ${this.moons[i].name} shots at ${this.remoteSpaceObjects[j].name}`)
              // info(`ATS: ${angleToShip} deg`)
              this.worldSpaceObjects[i].armedDelay = 0
              fire(this.worldSpaceObjects[i])
            } else {
              this.worldSpaceObjects[i].lastDamagedByName = ''
            }
          }
        }
      }

      const obj = this.worldSpaceObjects[this.nextWorldObjectToSendIndex]
      if (obj) {
        this.worldSpaceObjects[this.nextWorldObjectToSendIndex] = this.prepareSoToSend(obj)
        this.worldSpaceObjects[this.nextWorldObjectToSendIndex].collidingWith = []
        this.broadcaster(globalConnectedClients, this.worldSpaceObjects[this.nextWorldObjectToSendIndex], this.tied_session_id)
        this.nextWorldObjectToSendIndex++
        if (this.nextWorldObjectToSendIndex >= this.worldSpaceObjects.length) {
          this.nextWorldObjectToSendIndex = 0
        }
      } else {
        // warn('oh shit')
        // console.log("nextAsteroidToSendIndex", this.nextAsteroidToSendIndex, this.moons)
      }

      // Send town updates if there are any:
      // this.updateTownsIfApplicable()

      this.lastTime = performance.now()
    }, this.minTickTimeMs)
  }
  // server main loop end

  /**
   * Getting the objects from the defined world
   */
  setWorldSpaceObjects() {
    console.log('Getting worldspaceobjects')
    if (!this.gameMap) {
      warn('No gameMap initialiazed')
      return
    }

    //Planets
    for (let i = 0; i < this.gameMap.planets.length; i++) {
      const planet = this.gameMap.planets[i]
      this.worldSpaceObjects.push(planet)
    }

    //Moons
    for (let i = 0; i < this.gameMap.moons.length; i++) {
      this.worldSpaceObjects.push(this.gameMap.moons[i])
    }

    //SpaceTowns and its buildings
    for (let i = 0; i < this.gameMap.towns.length; i++) {
      const spaceTowns = this.gameMap.towns[i]

      //Adding SpaceTowns buildings to worldSpaceObjects
      for (let j = 0; j < spaceTowns.buildings.length; j++) {
        this.worldSpaceObjects.push(spaceTowns.buildings[j])
      }
    }
  }

  updateTownsIfApplicable() {
    if (!this.gameMap) {
      warn('No gameMap initialiazed')
      return
    }

    for (let i = 0; i < this.gameMap.planets.length; i++) {
      const planet = this.gameMap.planets[i]

      this.broadcaster(globalConnectedClients, planet, this.tied_session_id)
    }

    for (let i = 0; i < this.gameMap.towns.length; i++) {
      for (let j = 0; j < this.gameMap.towns[i].buildings.length; j++) {
        const building = this.gameMap.towns[i].buildings[j]
        this.broadcaster(globalConnectedClients, building, this.tied_session_id)
      }
    }
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

    if (so.spaceObjectType !== SpaceObjectType.PLAYER) {
      for (let i = 0; i < this.worldSpaceObjects.length; i++) {
        if (this.worldSpaceObjects[i].name === so.name) {
          return
        }
      }
      good(`Adding ${so.name} in world list`)
      this.worldSpaceObjects.push(so)
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
      this.broadcaster(globalConnectedClients, this.worldSpaceObjects[i], this.tied_session_id)
    }
  }

  createEnemy() {
    const enemyShip = createEnemyShip(this.tied_session_id)

    this.worldSpaceObjects.push(enemyShip)
  }

  createAndAddNewSpaceObject(so: SpaceObject) {
    if (so.isDead) {
      return
    } else {
      this.worldSpaceObjects.push(so)
    }
  }
  // never called this method... gah.
  checkHittingShots() {
    const spaceObjects = [...this.worldSpaceObjects, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

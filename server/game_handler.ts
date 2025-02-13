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

  // Using fixed dt instead of a variable dt
  private readonly FIXED_DT = 16.67 // milliseconds per update (~60 updates per second)
  private remoteSpaceObjects: SpaceObject[] = []
  private lastTime = performance.now()
  private accumulator = 0
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

    // Initialize timing for the fixed timestep loop
    this.lastTime = performance.now()
    this.accumulator = 0

    // Server main loop using fixed timestep
    this.game_interval = setInterval(() => {
      const now = performance.now()
      let frameTime = now - this.lastTime
      const MAX_FRAME_TIME = 100 // cap to avoid spiral of death on lag spikes
      if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME
      this.lastTime = now
      this.accumulator += frameTime

      // Run fixed-timestep physics updates
      while (this.accumulator >= this.FIXED_DT) {
        // Remove outdated objects from both lists
        this.worldSpaceObjects = removeOblitiratedSpaceObjects(this.worldSpaceObjects)
        this.remoteSpaceObjects = removeOblitiratedSpaceObjects(this.remoteSpaceObjects)

        // Update remote space objects with fixed dt
        for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
          this.remoteSpaceObjects[i] = updateSpaceObject(this.remoteSpaceObjects[i], this.FIXED_DT)
        }

        // Process collisions and shots
        this.checkHittingShots()

        // Update world space objects (NPCs, moons, etc.) with fixed dt
        for (let i = 0; i < this.worldSpaceObjects.length; i++) {
          this.worldSpaceObjects[i] = updateSpaceObject(this.worldSpaceObjects[i], this.FIXED_DT)
        }

        // Process NPC logic for attacking players
        for (let i = 0; i < this.worldSpaceObjects.length; i++) {
          for (let j = 0; j < this.remoteSpaceObjects.length; j++) {
            if (this.worldSpaceObjects[i].lastDamagedByName === this.remoteSpaceObjects[j].name) {
              const angleToShip = angle2(sub2(getWorldCoordinates(this.remoteSpaceObjects[j]), getWorldCoordinates(this.worldSpaceObjects[i])))
              this.worldSpaceObjects[i].angleDegree = rndf(0, 0) + angleToShip
              if (dist2(getWorldCoordinates(this.worldSpaceObjects[i]), getWorldCoordinates(this.remoteSpaceObjects[j])) < 1200) {
                this.worldSpaceObjects[i].armedDelay = 0
                fire(this.worldSpaceObjects[i])
              } else {
                this.worldSpaceObjects[i].lastDamagedByName = ''
              }
            }
          }
        }

        this.accumulator -= this.FIXED_DT
      }

      // Broadcast an update for one world object per tick (round-robin)
      const obj = this.worldSpaceObjects[this.nextWorldObjectToSendIndex]
      if (obj) {
        this.worldSpaceObjects[this.nextWorldObjectToSendIndex] = this.prepareSoToSend(obj)
        this.worldSpaceObjects[this.nextWorldObjectToSendIndex].collidingWith = []
        this.broadcaster(globalConnectedClients, this.worldSpaceObjects[this.nextWorldObjectToSendIndex], this.tied_session_id)
        this.nextWorldObjectToSendIndex++
        if (this.nextWorldObjectToSendIndex >= this.worldSpaceObjects.length) {
          this.nextWorldObjectToSendIndex = 0
        }
      }
      // Optionally, send additional updates (e.g. town updates) here if needed
    }, this.FIXED_DT)
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

    // Planets
    for (let i = 0; i < this.gameMap.planets.length; i++) {
      const planet = this.gameMap.planets[i]
      this.worldSpaceObjects.push(planet)
    }

    // Moons
    for (let i = 0; i < this.gameMap.moons.length; i++) {
      this.worldSpaceObjects.push(this.gameMap.moons[i])
    }

    // SpaceTowns and its buildings
    for (let i = 0; i < this.gameMap.towns.length; i++) {
      const spaceTowns = this.gameMap.towns[i]
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
    // (Optional: broadcast immediately if needed)
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

  // Processes collisions between objects
  checkHittingShots() {
    const spaceObjects = [...this.worldSpaceObjects, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

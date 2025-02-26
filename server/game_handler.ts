import { info, usNow, rndfVec2, good, newVec2, rndi, smul2, dist2, angle2, sub2, rndf, warn, add2, lintra, EveryInterval } from 'mathil'
import { MessageType, SpaceObject, SpaceObjectType, SpaceRelation } from '../src/lib/interface'

import { Client, globalConnectedClients } from './main'
import { maxNrOfSplits, orbitingScale, worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'
import { createCompanionShip, createEnemyShip, createMoon, createSpaceObject } from '../src/lib/factory'
import { angleTo, fire, flyToSpaceObject, followSpaceObject, generateMissileFrom, removeOblitiratedSpaceObjects } from '../src/lib/mechanics'
import { calculateMass, calculateRadius, getWorldCoordinates, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics/physics'
import { handleCollisions } from '../src/lib/physics/handleCollisions'
import { GameMap } from '../src/lib/worlds/worldInterface'
import { createWorldOne } from '../src/lib/worlds/worldFactory'
import { handleOrbit } from '../src/lib/physics/handleOrbit'

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
  private every25 = new EveryInterval(25)
  private every50 = new EveryInterval(50)
  private every100 = new EveryInterval(100)
  private every200 = new EveryInterval(200)
  private every300 = new EveryInterval(300)

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

      const initialLength = this.worldSpaceObjects.length
      this.worldSpaceObjects = removeOblitiratedSpaceObjects(this.worldSpaceObjects)
      if (this.worldSpaceObjects.length < initialLength) {
        this.nextWorldObjectToSendIndex = Math.max(0, this.nextWorldObjectToSendIndex - 1)
      }
      this.remoteSpaceObjects = removeOblitiratedSpaceObjects(this.remoteSpaceObjects)

      for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
        this.remoteSpaceObjects[i] = updateSpaceObject(this.remoteSpaceObjects[i], this.dt)
      }

      this.checkHittingShots()

      for (let i = 0; i < this.worldSpaceObjects.length; i++) {
        updateSpaceObject(this.worldSpaceObjects[i], this.dt)
      }

      handleOrbit(this.worldSpaceObjects)

      for (let i = 0; i < this.worldSpaceObjects.length; i++) {
        //For loop to check all the relations and logic between worldSpaceObjects and RemoteObjects (player ships)
        for (let j = 0; j < this.remoteSpaceObjects.length; j++) {
          if (this.worldSpaceObjects[i].spaceObjectType === SpaceObjectType.SHIP) {
            if (this.worldSpaceObjects[i].relation === SpaceRelation.ENEMY) {
              this.handleEnemy(this.worldSpaceObjects[i], this.remoteSpaceObjects[j])
            } else if (this.worldSpaceObjects[i].relation === SpaceRelation.COMPANION) {
              this.handleCompanion(this.worldSpaceObjects[i], this.remoteSpaceObjects[j])
            }
          }
        }
      }

      if (this.nextWorldObjectToSendIndex >= 0 && this.nextWorldObjectToSendIndex < this.worldSpaceObjects.length) {
        this.prepareSoToSend(this.worldSpaceObjects[this.nextWorldObjectToSendIndex])
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

  handleCompanion(worldSpaceObject: SpaceObject, remoteSpaceObject: SpaceObject) {
    const remoteSpaceObjectPos = getWorldCoordinates(worldSpaceObject)
    const worldSpaceObjectPos = remoteSpaceObject.cameraPosition

    if (worldSpaceObject.owner === remoteSpaceObject.name) {
      // angleTo(worldSpaceObject, remoteSpaceObject)
      followSpaceObject(worldSpaceObject, remoteSpaceObject)

      if (remoteSpaceObject.shotsFiredThisFrame) {
        // console.log('remote shooting', remoteSpaceObject.shotsFiredThisFrame)
        fire(worldSpaceObject)
      }
    }
  }

  handleEnemy(worldSpaceObject: SpaceObject, remoteSpaceObject: SpaceObject) {
    const remoteSpaceObjectPos = getWorldCoordinates(remoteSpaceObject)
    const worldSpaceObjectPos = worldSpaceObject.cameraPosition

    if (worldSpaceObject.lastDamagedByName === remoteSpaceObject.name) {
      const angleToShip = angle2(sub2(getWorldCoordinates(remoteSpaceObject), getWorldCoordinates(worldSpaceObject)))
      worldSpaceObject.angleDegree = rndf(0, 0) + angleToShip
      // console.log(`${worldSpaceObject} is shooting from distance: ${dist2(worldSpaceObjectPos, remoteSpaceObjectPos)}`)
      flyToSpaceObject(worldSpaceObject, remoteSpaceObject, 2000)

      if (dist2(worldSpaceObjectPos, remoteSpaceObjectPos) < 2000) {
        // console.log(`${worldSpaceObject} is shooting from distance: ${dist2(worldSpaceObjectPos, remoteSpaceObjectPos)}`)

        this.every50.tick(() => {
          fire(worldSpaceObject)
        })

        this.every200.tick(() => {
          fire(worldSpaceObject, newVec2(100, 100))
        })
      }
    }
  }

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
    if (so.isDead || so.deadFrameCount > 0) {
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

  createObjectAtPlayerPosition(clientName: string, type: SpaceObjectType, relation: SpaceRelation) {
    const foundPlayer = this.remoteSpaceObjects.find((so) => so.name === clientName)

    if (!foundPlayer) {
      warn(`No player found while creating request from ${clientName}`)
      return
    }

    switch (type) {
      case SpaceObjectType.SHIP:
        if (relation === SpaceRelation.ENEMY) {
          const enemyShip = createEnemyShip(this.tied_session_id, add2(foundPlayer.cameraPosition, foundPlayer.viewFramePosition))
          enemyShip.lastDamagedByName = foundPlayer.name
          this.worldSpaceObjects.push(enemyShip)
        } else if (relation === SpaceRelation.COMPANION) {
          const companionShip = createCompanionShip(
            this.tied_session_id,
            clientName,
            foundPlayer,
            add2(foundPlayer.cameraPosition, foundPlayer.viewFramePosition),
          )
          this.worldSpaceObjects.push(companionShip)
        }
        break

      default:
        warn(`Unknown space object type: ${type}`)
        break
    }
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
    // console.log('checking shots')
    const spaceObjects = this.worldSpaceObjects.concat(this.remoteSpaceObjects)
    handleCollisions(newVec2(), spaceObjects, null, (so, shotDmg) => this.handleHpChangeOnShot(so, shotDmg))
  }

  //Used as a callback when handleCollisions is returning an SO that has a change in HP-value
  handleHpChangeOnShot(so: SpaceObject, shotDmg: number): void {
    if (so.spaceObjectType === SpaceObjectType.MOON) {
      this.handleSplittingMoon(so, shotDmg)
    }
  }

  handleSplittingMoon(so: SpaceObject, shotDmg: number) {
    if ((so.health - shotDmg) / so.startHealth < 0.3) {
      if (so.splittedNrOfTimes >= maxNrOfSplits) {
        return
      }
      so.splittedNrOfTimes += 1

      for (let i = 1; i < 5; i++) {
        const splittedMoon = createMoon(so.sessionId)
        splittedMoon.position = so.position

        const splitDistance = 150

        //Instead of this, make an explosion or something that actually resembles the moon to split
        splittedMoon.cameraPosition = add2(so.cameraPosition, newVec2(rndf(-i * splitDistance, i * splitDistance), rndf(-i * splitDistance, i * splitDistance)))

        splittedMoon.owner = so.name
        splittedMoon.velocity = rndfVec2(-0.5, 0.5)
        splittedMoon.size = smul2(so.size, rndf(0.5, 0.8))
        splittedMoon.hitRadius = calculateRadius(splittedMoon.size)
        splittedMoon.orbitingAltitude = splittedMoon.hitRadius * orbitingScale
        splittedMoon.mass = calculateMass(splittedMoon.size)

        splittedMoon.startHealth = so.health
        splittedMoon.health = so.health
        splittedMoon.splittedNrOfTimes = so.splittedNrOfTimes + 1

        //Just for some effect...
        setTimeout(() => {
          this.addNewSpaceObjects(splittedMoon)
        }, 50 * i)
      }
      //For fun to create defenders of a moon - Rebel defenders are attacking you!
      this.createObjectAtPlayerPosition(so.lastDamagedByName, SpaceObjectType.SHIP, SpaceRelation.ENEMY)
      so.health = 0
    }
  }

  sendChatMsg(so: SpaceObject, refSoName?: string) {
    so.lastMessage = `Stop shooting at me ${refSoName ? refSoName : 'player!'}`
    so.messageType = MessageType.CHAT_MESSAGE

    this.broadcaster(globalConnectedClients, so, this.tied_session_id)
  }
}

import { info, usNow, EveryInterval, rndfVec2, good, newVec2, rndi } from 'mathil'
import { NonPlayerCharacter, SpaceObject } from '../src/lib/interface'
import { createNpc } from '../src/lib/factory'
import { handleCollisions, updateSpaceObject, updateSpaceObjects } from '../src/lib/physics'
import { Client, globalConnectedClients } from './main'
import { worldStartPosition } from '../src/lib/constants'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../src/lib/websocket/shotOptimizer'

export class GameHandler {
  game_started = false
  asteroids: NonPlayerCharacter[] = []
  game_interval: NodeJS.Timer | undefined = undefined
  start_time_us: number = usNow()
  tied_session_id: string | null = null

  private remoteSpaceObjects: SpaceObject[] = []
  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1 / 60
  private every = new EveryInterval(2)
  broadcaster: (clients: Client[], data: NonPlayerCharacter, sessionId: string | null) => void

  constructor(bc: (clients: Client[], data: NonPlayerCharacter, sessionId: string | null) => void) {
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

    this.game_interval = setInterval(() => {
      this.dt = performance.now() - this.lastTime

      updateSpaceObjects(this.remoteSpaceObjects, this.dt)
      this.checkHittingShots()

      for (let i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i] = updateSpaceObject(this.asteroids[i], this.dt)

        this.asteroids.filter((asteroid) => {
          return !asteroid.isDead
        })

        this.every.tick(() => {
          // warn(`Playing clients: ${this.remoteSpaceObjects.length}`)
          this.asteroids[i].collidingWith = []
          this.broadcaster(globalConnectedClients, this.asteroids[i], sessionId)
        })
      }
      this.lastTime = performance.now()
    }, this.minTickTimeMs)
  }

  spawnAsteroids(): NonPlayerCharacter[] {
    const num = 10
    info(`Creating ${num} asteroids`)
    for (let i = 0; i < num; i++) {
      const npc = createNpc()
      npc.velocity = rndfVec2(-0.5, 1)
      npc.cameraPosition = rndfVec2(worldStartPosition.x, worldStartPosition.y + 1000)
      this.asteroids.push(npc)
    }
    return this.asteroids
  }

  addNewSpaceObjects(so: SpaceObject) {
    for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
      if (this.remoteSpaceObjects[i].name === so.name) {
        return
      }
    }
    good(`Adding ${so.name} in remote list`)
    this.remoteSpaceObjects.push(so)
  }

  handleSpaceObjectUpdate(so: SpaceObject) {
    for (let i = 0; i < this.remoteSpaceObjects.length; i++) {
      this.remoteSpaceObjects[i] = spaceObjectUpdateAndShotReciverOptimizer(so, this.remoteSpaceObjects[i])
    }
    this.addNewSpaceObjects(so)
  }

  // never called this method... gah.
  checkHittingShots() {
    const spaceObjects = [...this.asteroids, ...this.remoteSpaceObjects]
    handleCollisions(newVec2(), spaceObjects)
  }
}

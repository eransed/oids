import { info, warn, usNow, EveryInterval, newVec2d } from 'mathil'
import { MessageType, NonPlayerCharacter, SpaceObject } from '../src/lib/interface'
import { createNpc } from '../src/lib/factory'
import { updateNonPlayerCharacter } from '../src/lib/physics'
import { Client, getActivePlayersFromSession, getPlayersFromSessionId, globalConnectedClients } from './main'
import { bounceSpaceObject } from '../src/lib/mechanics'
import { saveGame } from './api/users/users.services'

export class GameHandler {
  game_started = false
  asteroids: NonPlayerCharacter[] = []
  game_interval: NodeJS.Timer | undefined = undefined
  start_time_us: number = usNow()

  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1 / 60
  private every = new EveryInterval(2)
  private screenSize = newVec2d(1200, 720)
  broadcaster: (clients: Client[], data: NonPlayerCharacter, sessionId: string | null) => void

  constructor(bc: (clients: Client[], data: NonPlayerCharacter, sessionId: string | null) => void) {
    this.broadcaster = bc
  }

  game_session_start(sessionId: string) {
    info(`Starting game and creating asteroids...`)
    this.spawnAsteroids()

    this.game_interval = setInterval(() => {
      // info(`Game tick ${this.dt}`)
      this.dt = performance.now() - this.lastTime
      for (let i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i] = updateNonPlayerCharacter(this.asteroids[i], this.dt)
        bounceSpaceObject(this.asteroids[i], this.asteroids[i].viewport, 0.8, 10, 0)
        this.every.tick(() => {
          this.broadcaster(globalConnectedClients, this.asteroids[i], sessionId)
        })
      }
      this.lastTime = performance.now()
      if (getActivePlayersFromSession(sessionId).length === 0) {
        //do something when no players left in session
        // clearInterval(this.game_interval)
      }
    }, this.minTickTimeMs)
    /**
     * ToDo: Save the game when finished to all clients.
     */
    // saveGame('011ef253-eae8-4da5-9eb1-6a0a3816c7e5', false, new Date(), sessionId)
  }

  checkMessage(obj: SpaceObject) {
    if (obj.messageType === MessageType.START_GAME) {
      if (this.game_started) {
        warn(`Game already running`)
      } else {
        info(`Starting new game`)
        this.game_session_start(obj.sessionId)
        this.game_started = false
      }
    }
  }

  spawnAsteroids(): NonPlayerCharacter[] {
    const num = 2
    for (let i = 0; i < num; i++) {
      const npc = createNpc()

      this.asteroids.push(npc)
    }
    return this.asteroids
  }
}

import { info, warn, usNow, EveryInterval, newVec2 } from 'mathil'
import { MessageType, NonPlayerCharacter, SpaceObject } from '../src/lib/interface'
import { createNpc } from '../src/lib/factory'
import { updateNonPlayerCharacter } from '../src/lib/physics'
import { Client, getActivePlayersFromSession, getPlayersFromSessionId, globalConnectedClients } from './main'
import { bounceSpaceObject } from '../src/lib/mechanics'
import { saveGame } from './api/users/users.services'
import { bounceFactor } from '../src/lib/constants'

export class GameHandler {
  game_started = false
  asteroids: NonPlayerCharacter[] = []
  game_interval: NodeJS.Timer | undefined = undefined
  start_time_us: number = usNow()
  tied_session_id: string | null = null

  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1 / 60
  private every = new EveryInterval(2)
  private screenSize = newVec2(1200, 720)
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
    info(`Starting game and creating asteroids...`)
    this.spawnAsteroids()

    this.game_interval = setInterval(() => {
      // info(`Game tick ${this.dt}`)
      this.dt = performance.now() - this.lastTime
      for (let i = 0; i < this.asteroids.length; i++) {
        this.asteroids[i] = updateNonPlayerCharacter(this.asteroids[i], this.dt)
        bounceSpaceObject(this.asteroids[i], this.asteroids[i].viewport, bounceFactor, 10, 0)
        this.every.tick(() => {
          this.broadcaster(globalConnectedClients, this.asteroids[i], sessionId)
        })
      }
      this.lastTime = performance.now()
      // if (getActivePlayersFromSession(sessionId).length === 0) {
      //   this.quit_game()
      // }
    }, this.minTickTimeMs)
    /**
     * ToDo: Save the game when finished to all clients.
     */
    // saveGame('011ef253-eae8-4da5-9eb1-6a0a3816c7e5', false, new Date(), sessionId)
  }

  checkMessage(obj: SpaceObject) {
    if (obj.messageType === MessageType.START_GAME) {
      if (this.game_started) {
        warn(`Game ${this.tied_session_id} already running`)
      } else {
        info(`Starting new game`)
        this.game_session_start(obj.sessionId)
        if (this.tied_session_id === null) this.tied_session_id = obj.sessionId
        this.game_started = true
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

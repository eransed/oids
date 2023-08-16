import { info, warn, usNow } from 'mathil'
import { MessageType, NonPlayerCharacter, SpaceObject } from '../src/lib/interface'
import { createNpc } from '../src/lib/factory'
import { updateNonPlayerCharacter } from '../src/lib/physics'

export class GameHandler {
  game_started = false
  asteroids: NonPlayerCharacter[] = []
  game_interval: NodeJS.Timer | null = null
  start_time_us: number = usNow()
  private lastTime = performance.now()
  private dt = performance.now()
  private minTickTimeMs = 1000
  broadcaster: (data: NonPlayerCharacter, sessionId: string | null) => void

  constructor(bc: (data: NonPlayerCharacter, sessionId: string | null) => void) {
    this.broadcaster = bc
  }


  game_session_start(sessionId: string) {
    this.spawnAsteroids()
    this.game_interval = setInterval(() => {
      // info(`Game tick`)
      this.asteroids.forEach((a) => {
        this.dt = performance.now() - this.lastTime
        updateNonPlayerCharacter(a, this.dt)
        this.broadcaster(a, sessionId)
        this.lastTime = performance.now()
      })
    }, this.minTickTimeMs)
  }

  checkMessage(obj: SpaceObject) {
    if (obj.messageType === MessageType.START_GAME) {
      if (this.game_started) {
        warn(`Game already running`)
      } else {
        info(`Starting new game`)
        this.game_session_start(obj.sessionId)
      }
      this.game_started = true
    }
  }

  spawnAsteroids(): NonPlayerCharacter[] {
    const num = 10
    for (let i = 0; i < num; i++) {
      const npc = createNpc()

      this.asteroids.push(npc)
    }
    return this.asteroids
  }
}

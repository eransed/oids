import { info, warn, usNow, usPretty } from 'mathil'
import { MessageType, NonPlayerCharacter, SpaceObject } from '../src/lib/interface'
import { Client } from './main'
import { createNpc, createSpaceObject } from '../src/lib/factory'
import { updateSpaceObjects } from '../src/lib/physics'

export class GameHandler {
  game_started = false
  asteroids: NonPlayerCharacter[] = []
  game_interval: NodeJS.Timer | null = null
  start_time_us: number = usNow()
  broadcaster: (data: unknown, sessionId: string | null) => void

  constructor(bc: (data: unknown, sessionId: string | null) => void) {
    this.broadcaster = bc
  }

  game_session_start(sessionId: string) {
    this.game_interval = setInterval(() => {
      //update game state
      this.asteroids.forEach((a) => {
        this.broadcaster(a, sessionId)
      })
      //   updateSpaceObjects(this.asteroids, 10, null)
    }, 10)
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

import type { game } from '../../../pages/GamePage/components/Game/Utils/mainGame'
import type { ServerUpdate, SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { log } from 'mathil'

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  const so: SpaceObject = su.dataObject
  for (let i = 0; i < game.remotePlayers.length; i++) {
    if (so.name === game.remotePlayers[i].name) {
      if (!so.online) {
        console.log(`${so.name} went offline`)
        game.remotePlayers.splice(i)
        continue
      }

      game.remotePlayers[i] = spaceObjectUpdateAndShotReciverOptimizer(so, game.remotePlayers[i])

      return
    }
  }
  if (so.name !== game.localPlayer.name) {
    game.remotePlayers.push(so)
    log(`New ship online: ${so.name}`)
  }
}

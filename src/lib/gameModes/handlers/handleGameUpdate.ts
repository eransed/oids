import type { ServerUpdate, SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { logInfo } from '../../../stores/alertHandler'

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  console.log(su)
  const so: SpaceObject = su.dataObject
  for (let i = 0; i < game.remotePlayers.length; i++) {
    if (so.name === game.remotePlayers[i].name) {
      if (!so.online) {
        logInfo(`${so.name} went offline`)
        game.remotePlayers.splice(i)
        continue
      }

      game.remotePlayers[i] = spaceObjectUpdateAndShotReciverOptimizer(so, game.remotePlayers[i])

      return
    }
  }
  if (so.name !== game.localPlayer.name) {
    game.remotePlayers.push(so)
    logInfo(`New ship online: ${so.name}`)
  }
}

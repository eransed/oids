import type { ServerUpdate, SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { logInfo } from '../../../stores/alertHandler'

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  // console.log(su)
  const so: SpaceObject = su.dataObject
  if (so.name !== game.localPlayer.name) {
    const foundPlayer = game.remotePlayers.find((v) => so.name === v.name)

    if (!foundPlayer) {
      logInfo(`New ship online: ${so.name}`)

      game.remotePlayers.push(so)
    } else {
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
    }
  }
}

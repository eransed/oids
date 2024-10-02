import { MessageType, type ServerUpdate, type SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { addAlert, logInfo } from '../../../components/alert/alertHandler'
import { createSpaceObject } from '../../factory'

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  const so: SpaceObject = su.dataObject

  if (so.name !== game.localPlayer.name) {
    if (!game.remotePlayers.find((v) => v.name === so.name)) {
      addAlert('info', `New player online: ${so.name}`)
      game.remotePlayers.push(createSpaceObject(so.name, MessageType.GAME_UPDATE))
    }

    for (let i = 0; i < game.remotePlayers.length; i++) {
      if (so.name === game.remotePlayers[i].name) {
        // for (const key in so) {
        //   game.remotePlayers[i][key as keyof SpaceObject] = so[key as keyof unknown]
        // }

        console.log(so)

        game.remotePlayers[i] = spaceObjectUpdateAndShotReciverOptimizer(so, game.remotePlayers[i])

        if (!game.remotePlayers[i].online) {
          logInfo(`${so.name} went offline`)
          game.remotePlayers.splice(i)
          continue
        }

        return
      }
    }
  }
}

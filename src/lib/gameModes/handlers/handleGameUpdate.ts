import { MessageType, type ServerUpdate, type SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { addAlert, logInfo } from '../../../components/alert/alertHandler'
import { createSpaceObject } from '../../factory'
import { Every } from '../../time'

const every200 = new Every(200)

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  const so: SpaceObject = su.dataObject

  every200.tick(() => {
    console.log(so)
  })

  if (so.name !== game.localPlayer.name && so.sessionId === game.localPlayer.sessionId) {
    if (!game.remotePlayers.find((v) => v.name === so.name)) {
      addAlert('info', `New player online: ${so.name}`)
      console.log('new player online: ', so)
      game.remotePlayers.push(createSpaceObject(so.name, MessageType.GAME_UPDATE))
      console.log(game.remotePlayers, game.remotePlayers.length)
    }

    for (let i = 0; i < game.remotePlayers.length; i++) {
      if (so.name === game.remotePlayers[i].name) {
        //Loops through the keys of incoming partialSo and adds the values to the right key of stored so
        //If the key is shotsInFlight we want to concatenate the shots
        for (const key in so) {
          if (key === ('shotsInFlight' as keyof SpaceObject)) {
            game.remotePlayers[i].shotsInFlight = [...game.remotePlayers[i].shotsInFlight, ...so.shotsInFlight]
          } else {
            game.remotePlayers[i][key as keyof SpaceObject] = so[key as keyof unknown]
          }
        }

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

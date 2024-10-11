import { MessageType, type ServerUpdate, type SpaceObject } from '../../interface'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../../websocket/shotOptimizer'
import type { Game } from '../../game'
import { addAlert, logInfo } from '../../../components/alert/alertHandler'
import { createSpaceObject } from '../../factory'
import { Every } from '../../time'

const every200 = new Every(200)

// const updateBuffer: ServerUpdate<SpaceObject>[] = []
// const updateInterval = 50 // Process updates every 100ms
// let g: Game | undefined = undefined

// export function handleIncomingUpdate(serverUpdate: ServerUpdate<SpaceObject>, game: Game) {
//   updateBuffer.push(serverUpdate) // Push incoming updates to the buffer
//   g = game
// }

// function processBufferedUpdates(game: Game) {
//   while (updateBuffer.length > 0) {
//     const su = updateBuffer.shift() // Get the oldest update from the buffer
//     if (su) {
//       handleGameUpdate(su, game) // Process the update
//     }
//   }
// }

// // Start the throttling mechanism
// setInterval(() => {
//   if (g) {
//     processBufferedUpdates(g) // Process buffered updates at the defined interval
//   } else {
//     //
//   }
// }, updateInterval)

export function handleGameUpdate(su: ServerUpdate<SpaceObject>, game: Game) {
  const so: SpaceObject = su.dataObject

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

        // console.log(so.framesSinceLastServerUpdate)

        const remote = game.remotePlayers[i]

        for (const key in so) {
          if (key === ('shotsInFlight' as keyof SpaceObject)) {
            remote.shotsInFlight = [...remote.shotsInFlight, ...so.shotsInFlight]
          } else {
            remote[key as keyof SpaceObject] = so[key as keyof unknown]
          }
        }

        remote.framesSinceLastServerUpdate = 0

        game.remotePlayers[i] = remote

        if (!remote.online) {
          logInfo(`${so.name} went offline`)
          game.remotePlayers.splice(i)
          continue
        }

        return
      }
    }
  }
}

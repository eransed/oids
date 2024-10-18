import { logError } from '../../../components/alert/alertHandler'
import { handleIncomingChatMessage } from '../../../pages/GameLobby/handlers/handleChatMessages'
import type { Game } from '../../game'
import { type ServerUpdate, type SpaceObject, MessageType } from '../../interface'
import { handleGameUpdate } from './handleGameUpdate'
import { handleServerInformationUpdate } from './incomingDataHandlers/handleServerInformationUpdate'
import { handleShipUpdate } from './incomingDataHandlers/handleShipUpdate'

export function playerUpdate(serverUpdate: ServerUpdate<SpaceObject>, game: Game) {
  switch (serverUpdate.dataObject.messageType) {
    case MessageType.SHIP_UPDATE:
      handleShipUpdate(serverUpdate)
      break
    case MessageType.SERVICE:
      handleServerInformationUpdate(serverUpdate, game)
      break
    case MessageType.CHAT_MESSAGE:
      handleIncomingChatMessage(serverUpdate.dataObject, game.localPlayer.name)
      break

    // case MessageType.GAME_UPDATE || MessageType.SESSION_UPDATE || MessageType.LEFT_SESSION:
    default:
      if (serverUpdate.dataObject) {
        handleGameUpdate(serverUpdate, game)
      }
    // default:
    //   logError(`Wrong messagetype from server: ${MessageType[serverUpdate.dataObject.messageType]}`)
    //   break
  }
}

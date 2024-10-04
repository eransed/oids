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
    default:
      if (serverUpdate.dataObject) {
        handleGameUpdate(serverUpdate, game)
      }
      break
  }
}

import type { Game } from '../../game'
import { type ServerUpdate, type SpaceObject, MessageType } from '../../interface'
import { handleGameUpdate } from './handleGameUpdate'
import { handleChatUpdate } from './incomingDataHandlers/handleChatUpdate'
import { handleServerInformationUpdate } from './incomingDataHandlers/handleServerInformationUpdate'
import { handleShipUpdate } from './incomingDataHandlers/handleShipUpdate'

export function playerUpdate(so: ServerUpdate<SpaceObject>, game: Game) {
  switch (so.dataObject.messageType) {
    case MessageType.SHIP_UPDATE:
      handleShipUpdate(so)
      break
    case MessageType.SERVICE:
      handleServerInformationUpdate(so, game)
      break
    case MessageType.CHAT_MESSAGE:
      handleChatUpdate(so)
      break
    default:
      if (so.dataObject) {
        handleGameUpdate(so, game)
      }
      break
  }
}

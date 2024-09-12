import { handleIncomingChatMessage } from '../../../../pages/GameLobby/handlers/handleChatMessages'
import type { ServerUpdate, SpaceObject } from '../../../interface'

export function handleChatUpdate(playerUpdate: ServerUpdate<SpaceObject>) {
  handleIncomingChatMessage(playerUpdate.dataObject)
}

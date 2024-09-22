import type { ServerUpdate, SpaceObject } from '../../../interface'
import type { Game } from '../../../game'
import { logInfo } from '../../../../stores/alertHandler'

export function handleServerInformationUpdate(playerUpdate: ServerUpdate<SpaceObject>, game: Game) {
  game.serverVersion = playerUpdate.dataObject.serverVersion
  logInfo(`Service message: server version: ${playerUpdate.dataObject.serverVersion}`)
}

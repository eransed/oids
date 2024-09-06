import { info } from 'mathil'
import type { ServerUpdate, SpaceObject } from '../../../interface'
import type { Game } from '../../../game'

export function handleServerInformationUpdate(playerUpdate: ServerUpdate<SpaceObject>, game: Game) {
  game.serverVersion = playerUpdate.dataObject.serverVersion
  info(`Service message: server version: ${playerUpdate.dataObject.serverVersion}`)
}

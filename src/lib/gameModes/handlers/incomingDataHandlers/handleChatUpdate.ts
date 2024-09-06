import { chatMsgHistoryStore } from '../../../../stores/stores'
import type { ServerUpdate, SpaceObject } from '../../../interface'

export function handleChatUpdate(playerUpdate: ServerUpdate<SpaceObject>) {
  chatMsgHistoryStore.update((previousMessages) => [
    ...previousMessages,
    {
      message: playerUpdate.dataObject.lastMessage,
      timeDate: new Date(),
      user: playerUpdate.dataObject,
    },
  ])
}

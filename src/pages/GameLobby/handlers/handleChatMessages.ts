import type { ChatMessage, SpaceObject } from '../../../lib/interface'
import { chatMsgHistoryStore } from '../../../stores/stores'

export function handleIncomingChatMessage(incomingUpdate: SpaceObject) {
  const newMsg: ChatMessage = {
    message: incomingUpdate.lastMessage,
    timeDate: new Date(),
    user: incomingUpdate,
  }

  chatMsgHistoryStore.update((messages) => {
    return [...messages, newMsg]
  })
}

import type { ChatMessage, SpaceObject } from '../../../lib/interface'
import { logInfo } from '../../../components/alert/alertHandler'
import { chatMsgHistoryStore } from '../../../stores/stores'

export function handleIncomingChatMessage(incomingUpdate: SpaceObject) {
  const newMsg: ChatMessage = {
    message: incomingUpdate.lastMessage,
    timeDate: new Date(),
    user: incomingUpdate,
  }

  logInfo(`${incomingUpdate.name}: ${incomingUpdate.lastMessage}`)

  chatMsgHistoryStore.update((messages) => {
    return [...messages, newMsg]
  })
}

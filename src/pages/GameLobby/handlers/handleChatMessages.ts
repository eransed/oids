import type { ChatMessage, SpaceObject } from '../../../lib/interface'
import { logInfo } from '../../../components/alert/alertHandler'
import { chatMsgHistoryStore } from '../../../stores/stores'

export function handleIncomingChatMessage(incomingUpdate: SpaceObject, localPlayerName: string) {
  const newMsg: ChatMessage = {
    message: incomingUpdate.lastMessage,
    timeDate: new Date(),
    user: incomingUpdate,
  }

  const firstWord = incomingUpdate.lastMessage.split(' ')[0]

  console.log(firstWord + localPlayerName)

  if (firstWord.includes('@') && firstWord.includes(localPlayerName)) {
    newMsg.message = incomingUpdate.lastMessage.substring(incomingUpdate.lastMessage.indexOf(' ') + 1)
    logInfo(`${incomingUpdate.name} mentioned you: ${newMsg.message}`)
  }

  chatMsgHistoryStore.update((messages) => {
    return [...messages, newMsg]
  })
}

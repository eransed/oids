<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { chatMessageHistory, localPlayer, socket } from '../../stores/stores'

  //Components
  import TypeWriter from '../typeWriter/TypeWriter.svelte'
  import { MessageType, type ChatMessage } from '../../lib/interface'

  let chatMsg: string
  export let joinedSessionId: string

  function dateTimeFormat(d: Date): string {
    const ms = ('' + d.getMilliseconds()).padStart(3, '0')
    return `${d.toLocaleString('sv-SE')}.${ms}`
  }

  export function scrollToBottom(): void {
    const messageDiv = document.getElementById('messagesDiv')
    if (messageDiv) {
      setTimeout(() => {
        messageDiv.scrollTop = messageDiv.scrollHeight
      }, 300)
    }
  }

  function sendRawChatMessage(msgStr: string) {
    const chatMessage: ChatMessage = {
      message: msgStr,
      user: $localPlayer,
      timeDate: new Date(),
    }
    $chatMessageHistory.push(chatMessage)
    $chatMessageHistory = $chatMessageHistory

    $localPlayer.messageType = MessageType.CHAT_MESSAGE
    $localPlayer.lastMessage = msgStr
    $socket.send($localPlayer)
    chatMsg = ''
    scrollToBottom()
  }

  function sendChatMessage() {
    const msgSet: Set<string> = new Set()

    let uniqueMsg: string[] = []

    chatMsg.split('').forEach((msg) => {
      msgSet.add(msg)
    })

    msgSet.forEach((msg) => {
      uniqueMsg.push(msg)
    })

    if (chatMsg.length > 0) {
      if (uniqueMsg.length === 1 && uniqueMsg[0] === ' ') {
        return
      } else sendRawChatMessage(chatMsg)
    }
  }
</script>

<p style="margin-left: 0.5em">Chat - {joinedSessionId}</p>

<div class="messages" id="messagesDiv">
  {#each $chatMessageHistory as msg}
    {#if msg.serviceMsg}
      <span style="font-size: 0.8rem; font-style: italic; opacity: 0.5;">{msg.message}</span>
    {:else}
      <div in:fade={{ delay: 100 }}>
        <p style="margin-bottom: 1rem;">
          <span style="font-size: 0.65rem; color: var(--main-text-color)">
            {dateTimeFormat(msg.timeDate)} -
            <span style="font-size: 0.8rem; color: #c89;">
              {msg.user.name}:
            </span>
          </span>
          <br />
          <TypeWriter text={msg.message} delaySpeed={250} speed={35} startCallback={() => scrollToBottom()} />
        </p>
      </div>
    {/if}
  {/each}
</div>
<div class="msgInput">
  <form on:submit|preventDefault={sendChatMessage}>
    <input bind:value={chatMsg} placeholder="Got something to say?" type="text" />
    <button type="submit">Send</button>
  </form>
</div>

<style>
  .msgInput input {
    min-height: 2em;
  }

  .msgInput form {
    display: grid;
    grid-auto-columns: 4fr 1fr;
    grid-auto-flow: column;
  }
  .messages {
    max-height: 14em;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 100%;
    padding: 0.5em;
  }

  @media screen and (max-width: 750px) {
    .messages {
      height: 100%;
    }
  }
</style>

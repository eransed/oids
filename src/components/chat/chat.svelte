<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { chatMessageHistory, localPlayer, socket } from '../../stores/stores'

  //Components
  import TypeWriter from '../typeWriter/TypeWriter.svelte'
  import { MessageType, type ChatMessage } from '../../lib/interface'

  //Assets
  import { Icons } from '../../style/icons'
  import Button90 from '../menu/Button90.svelte'

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
    <input bind:value={chatMsg} placeholder={`Aa`} type="text" />
    <!-- <button type="submit">Send</button> -->

    <Button90 minWidth="2em" borderBottom buttonType="submit" icon={Icons.Send} />
  </form>
</div>

<style>
  .msgInput input {
    height: 3em;
    margin: auto;
    inset: 0;
    min-height: 2em;
    padding-left: 1em;
    border: none;
    outline: none;
    background-color: var(--main-bg-color);
    color: var(--main-text-color);
    border-bottom: 1px solid var(--main-bg-color);
    border-radius: 0.8em;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 0px;
    border-bottom: 1px solid var(--main-accent-color);
    opacity: 0.7;
    width: 80%;
    transition: all 500ms;
  }

  .msgInput input:focus {
    height: 3.5em;
    width: 95%;
    opacity: 1;
    border-bottom: 1px solid var(--main-accent-color);
  }

  ::placeholder {
    color: var(--main-text-color);
  }

  .msgInput form {
    display: grid;
    grid-auto-columns: 4fr auto;
    grid-auto-flow: column;
  }
  .messages {
    max-height: 12.5em;
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

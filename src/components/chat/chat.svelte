<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { chatMsgHistoryStore, localPlayerStore, socketStore } from '../../stores/stores'

  //Components
  import TypeWriter from '../typeWriter/TypeWriter.svelte'
  import { MessageType, type ChatMessage, type SpaceObject } from '../../lib/interface'

  //Assets
  import { Icons } from '../../style/icons'
  import Button90 from '../menu/Button90.svelte'
  import { initKeyControllers, initTouchControls, removeKeyControllers, removeTouchControls } from '../../lib/input'
  import Info from '../info/info.svelte'

  $: chatMsg = '' as string

  export let joinedSessionId: string
  export let inGameChat: boolean = false
  export let chatTitle: boolean = true
  export let possibleMentions: SpaceObject[] = []
  $: showPossibleMentions = false
  let inputRef: HTMLInputElement

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
      user: $localPlayerStore,
      timeDate: new Date(),
    }
    $chatMsgHistoryStore.push(chatMessage)
    $chatMsgHistoryStore = $chatMsgHistoryStore

    $localPlayerStore.messageType = MessageType.CHAT_MESSAGE
    $localPlayerStore.lastMessage = msgStr
    $localPlayerStore.online = true
    $socketStore.send($localPlayerStore)
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

  function handleFocus(state: boolean) {
    checkIfToShowPossibleMentions()
    if (inGameChat) {
      if (state) {
        removeKeyControllers()
        removeTouchControls()
      } else {
        initKeyControllers()
        initTouchControls()
      }
    }
  }

  $: if (chatMsg !== undefined) {
    checkIfToShowPossibleMentions()
  }

  function checkIfToShowPossibleMentions() {
    const firstWord = chatMsg.split(' ')[0]
    if (firstWord.charAt(0) === '@' && chatMsg.length === 1) {
      showPossibleMentions = true
      // console.log(possibleMentions)
    } else {
      showPossibleMentions = false
    }
  }

  function handleMention(chatterName: string) {
    chatMsg += chatterName + ' '
    inputRef.focus()
  }
</script>

{#if chatTitle}
  <Info text={`Chat @ ${joinedSessionId}`} />
{/if}

<div class="messages" id="messagesDiv">
  {#each $chatMsgHistoryStore as msg}
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
    <div class="mentionButton">
      {#if showPossibleMentions}
        {#each possibleMentions as chatter}
          <button type="button" on:click={() => handleMention(chatter.name)}>{chatter.name}</button>
        {/each}
      {/if}
    </div>
    <input bind:this={inputRef} on:focus={() => handleFocus(true)} on:blur={() => handleFocus(false)} bind:value={chatMsg} placeholder={`Aa - @ to mention someone`} type="text" />
    <!-- <button type="submit">Send</button> -->
    <Button90 minWidth="2em" buttonType="submit" icon={Icons.Send} />
  </form>
</div>

<style>
  .msgInput {
    position: relative;
  }

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
    /* border-radius: 0.8em; */
    border-bottom-left-radius: 0px;
    border-top-right-radius: 0px;
    border-bottom: 1px solid var(--main-accent-color);
    opacity: 0.7;
    width: 80%;
    transition: all 500ms;
    margin-bottom: 0.5em;
  }

  .msgInput input:focus {
    height: 3.5em;
    width: 95%;
    opacity: 1;
    border-bottom: 1px solid var(--main-accent-color);
  }

  .mentionButton {
    position: absolute;
    z-index: 1;
    display: flex;
    /* position: relative; */
    bottom: 0;
    z-index: 1;
    gap: 0.2em;
    margin-bottom: -2em;
  }

  .mentionButton button {
    background: var(--main-accent-color);
    border: none;
    padding: 0.5em;
    border-radius: 1em;
  }

  .mentionButton button:hover {
    background-color: var(--main-accent2-color);
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
    width: 350px;
    padding: 0.5em;
  }

  @media screen and (max-width: 750px) {
    .messages {
      height: 100%;
    }
  }
</style>

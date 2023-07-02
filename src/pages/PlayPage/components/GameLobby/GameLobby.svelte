<script lang="ts">
  //Svelte

  //Stores
  import { guestUserName, user } from "../../../../stores/stores"

  //Interfaces
  import type { User } from "../../../../interfaces/user"
  import { MessageType, type SpaceObject } from "../../../../lib/interface"

  //Components

  import Page from "../../../../components/page/page.svelte"

  //Services
  import type { Session } from "../../../../lib/interface"
  import { createSpaceObject } from "../../../../lib/factory"

  import { getWsUrl } from "../../../../lib/websocket/webSocket"
  import { OidsSocket } from "../../../../lib/websocket/ws"
  import { createSessionId } from "../../../../helpers/util"
  import { activeSessions } from "../../../../lib/services/game/activeSessions"
  import SessionList from "./SessionList/SessionList.svelte"

  import { onDestroy, onMount } from "svelte"
  import { log, warn } from "mathil"

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })

  let sessions: Session[] = []
  const localPlayer = createSpaceObject($user ? $user.name : $guestUserName)
  const sock: OidsSocket = new OidsSocket(getWsUrl())
  const hostedSession = createSessionId()
  let chatMessageHistory: ChatMessage[] = []

  function hostSession() {
    localPlayer.sessionId = hostedSession
    localPlayer.messageType = MessageType.SESSION_UPDATE
    localPlayer.isHost = true
    sock.send(localPlayer)
  }

  interface ChatMessage {
    message: string
    timeDate: Date
    user: SpaceObject
    serviceMsg?: boolean
  }

  function createJoinMsg(session: string) {
    const msg: ChatMessage = {
      message: `Joined ${session}`,
      timeDate: new Date(),
      user: localPlayer,
      serviceMsg: true,
    }

    return msg
  }

  onMount(() => {
    hostSession()

    sock.addListener((su) => {
      const incomingUpdate = su.spaceObject

      if (!incomingUpdate.name) {
        return
      }

      console.log("someMsg ", incomingUpdate)

      if (incomingUpdate.messageType === MessageType.SESSION_UPDATE) {
        log("Update")
        updateSessions()
      } else if (incomingUpdate.messageType === MessageType.CHAT_MESSAGE) {
        const msg = incomingUpdate.lastMessage
        log(`${incomingUpdate.name} says: ${msg}`)
        const newMsg: ChatMessage = {
          message: incomingUpdate.lastMessage,
          timeDate: new Date(),
          user: incomingUpdate,
        }

        chatMessageHistory = [...chatMessageHistory, newMsg]
      }
    })

    setTimeout(() => {
      updateSessions()
    }, 200)
  })

  let joinedSession: Session | null = null

  function checkJoinedSession(): void {
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i]
      if (s.id === localPlayer.sessionId) {
        joinedSession = s
        log(`Joined session ${s.id}`)
        return
      }
    }
    warn("No joined session")
    leaveSession()
  }

  function dateTimeFormat(d: Date): string {
    const ms = ('' + d.getMilliseconds()).padStart(3, '0')
    return `${d.toLocaleString('sv-SE')}.${ms}`
  }

  function updateSessions() {
    activeSessions()
      .then((s) => {
        if (s.status === 200) {
          sessions = s.data
          checkJoinedSession()
        } else {
          console.error(`Sessions endpoint returned status ${s.status} ${s.statusText}`)
        }
      })
      .then(() => {
        console.log("Sessions: ", sessions)
      })
      .catch((e) => {
        console.error(`Failed to fetch sessions: ${e}`)
      })
  }

  onDestroy(() => {
    sock.disconnect()
  })

  /**
   * Todos:
   * Share game lobby link -> use as a param to get into lobby directly.
   */

  function joinSession_(otherPlayerWithSession: SpaceObject | null) {
    if (otherPlayerWithSession) {
      log(`${localPlayer.name}: joining session ${otherPlayerWithSession.sessionId} hosted by ${otherPlayerWithSession.name}`)
      localPlayer.sessionId = otherPlayerWithSession.sessionId
      // send some update that localPlayer joined a/the session
      localPlayer.messageType = MessageType.SESSION_UPDATE
      localPlayer.isHost = false
      chatMessageHistory = []
      chatMessageHistory = [...chatMessageHistory, createJoinMsg(otherPlayerWithSession.sessionId)]
      sock.send(localPlayer)
      setTimeout(() => {
        updateSessions()
      }, 200)
    } else {
      console.error("Join null session not possible...")
    }
  }

  function leaveSession() {
    log(`Leaving session`)
    joinedSession = null
    hostSession()
    updateSessions()
  }

  let chatMsg: string = ""

  function sendRawChatMessage(msgStr: string) {
    const chatMessage: ChatMessage = {
      message: msgStr,
      user: localPlayer,
      timeDate: new Date(),
    }
    chatMessageHistory.push(chatMessage)
    chatMessageHistory = chatMessageHistory

    localPlayer.messageType = MessageType.CHAT_MESSAGE
    localPlayer.lastMessage = msgStr
    sock.send(localPlayer)
    chatMsg = ""
  }

  function sendChatMessage() {
    sendRawChatMessage(chatMsg)
    // chatMsg = ""
  }

  function formatDate(date: Date) {
    const f = new Intl.DateTimeFormat("en-eu", {
      timeStyle: "medium",
      hour12: false,
    })

    return f.format(date)
  }
</script>

<Page>
  <div class="lobbyWrapper">
    <div class="left">
      <SessionList joinSession={joinSession_} {localPlayer} {sessions} />
    </div>
    <div class="center">
      {#if joinedSession}
        <div class="sessionInfo">
          <p>Session host: {joinedSession.host.name}</p>
          <p>Players:</p>
          {#each joinedSession.players as player}
            <p style="color: #c89">{player.name}</p>
          {/each}
        </div>
        <button
          on:click={() => {
            leaveSession()
          }}>Leave session</button
        >
      {:else}
        <p>No session joined</p>
      {/if}
    </div>
    <div class="right">
      <p>Chat - {joinedSession?.id}</p>

      <div class="messages">
        {#each chatMessageHistory as msg}
          {#if msg.serviceMsg}
            <span style="font-size: 0.8rem; font-style: italic; opacity: 0.5;">{msg.message}</span>
          {:else}
            <p style="margin-bottom: 1rem;">
              <span style="font-size: 0.65rem; color: #cdcdcd;">  
                {dateTimeFormat(msg.timeDate)} -
                <span style="font-size: 0.8rem; color: #c89;">
                {msg.user.name}:
                </span>
              </span>
              <br>
              {msg.message}
            </p>
          {/if}
        {/each}
      </div>
      <div class="msgInput">
        <form on:submit|preventDefault={sendChatMessage}>
          <input bind:value={chatMsg} placeholder="Got something to say?" type="text" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  </div>
</Page>

<style>
  .msgInput input {
    min-height: 2em;
  }

  .msgInput form {
    display: grid;
    grid-auto-columns: 4fr 1fr;
    grid-auto-flow: column;
  }

  .lobbyWrapper {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    max-width: 85%;
    min-height: 20em;
    max-height: 20em;
    /* place-items: center; */
  }

  .left,
  .center,
  .right {
    display: grid;
    border: 1px solid rgb(0, 255, 255, 0.2);
    padding: 0.5em;
    min-width: 22em;
    line-break: anywhere;
  }

  .center,
  .right {
    grid-template-rows: 1fr auto;
  }

  .messages {
    max-height: 14em;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 100%;
  }
</style>

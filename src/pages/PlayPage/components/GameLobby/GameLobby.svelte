<script lang="ts">
  //Svelte
  import { navigate } from "svelte-routing"

  //Stores
  import { gameSessionId, guestUserName, user } from "../../../../stores/stores"

  //Interfaces
  import type { Button90Config } from "../../../../interfaces/menu"
  import type { User } from "../../../../interfaces/user"
  import { MessageType, type SpaceObject } from "../../../../lib/interface"

  //Components

  import Page from "../../../../components/page/page.svelte"

  //Services
  import type { Session } from "../../../../lib/interface"
  import { createSpaceObject } from "../../../../lib/factory"
  import type { AxiosResponse } from "axios"
  import { getWsUrl } from "../../../../lib/websocket/webSocket"
  import { OidsSocket } from "../../../../lib/websocket/ws"
  import { createSessionId } from "../../../../helpers/util"
  import { activeSessions } from "../../../../lib/services/game/activeSessions"
  import SessionList from "./SessionList/SessionList.svelte"
  import SessionListRow from "./SessionList/SessionListRow.svelte"
  import { onDestroy, onMount } from "svelte"
  import { log, warn } from "mathil"

  let lobbyStep = 0
  let players: SpaceObject[]

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })

  const testMsg: ChatMessage = {
    message: "hej",
    timeDate: new Date(),
    user: createSpaceObject(),
  }

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
  }

  let lastMsg = "none"

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

        console.log("newMsg: ", newMsg)

        chatMessageHistory.push(newMsg)
        lastMsg = newMsg.message
        console.log(chatMessageHistory)
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

  const joinSession = () => {
    navigate(`/play/multiplayer/${$gameSessionId}`)
  }

  const submitButton: Button90Config = {
    buttonText: "Lets go!",
    clickCallback: () => {},
    selected: false,
  }

  const readyButton: Button90Config = {
    buttonText: "I'm ready!",
    clickCallback: () => (lobbyStep = 2),
    selected: false,
  }

  const back: Button90Config = {
    buttonText: "Back",
    clickCallback: () => (lobbyStep = 0),
    selected: false,
  }

  function joinSession_(otherPlayerWithSession: SpaceObject | null) {
    if (otherPlayerWithSession) {
      log(`${localPlayer.name}: joining session ${otherPlayerWithSession.sessionId} hosted by ${otherPlayerWithSession.name}`)
      localPlayer.sessionId = otherPlayerWithSession.sessionId
      // send some update that localPlayer joined a/the session
      localPlayer.messageType = MessageType.SESSION_UPDATE
      localPlayer.isHost = false
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

  let chatMsg: string = "Test"

  function sendRawChatMessage(msgStr: string) {
    const chatMessage: ChatMessage = {
      message: msgStr,
      user: localPlayer,
      timeDate: new Date(),
    }
    chatMessageHistory.push(chatMessage)
    console.log(chatMessage)
    localPlayer.messageType = MessageType.CHAT_MESSAGE
    localPlayer.lastMessage = msgStr
    sock.send(localPlayer)
    console.log(chatMessageHistory)
  }

  function sendChatMessage() {
    sendRawChatMessage(chatMsg)
    // chatMsg = ""
  }
</script>

<Page>
  <div class="lobbyWrapper">
    <div class="left">
      <SessionList joinSession={joinSession_} {localPlayer} {sessions} />
    </div>
    <div class="center">
      {#if joinedSession}
        <p>Session host: {joinedSession.host.name}</p>
        <p>Players:</p>
        {#each joinedSession.players as player}
          <p style="color: #34a">{player.name}</p>
        {/each}
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
      <p>Chat</p>
      <!-- <p>{chatMsg}</p> -->
      <div class="msgInput">
        <button
          on:click={() => {
            sendChatMessage()
          }}>Send</button
        >
        <!-- <form on:submit|preventDefault={() => sendChatMessage()}>
          <input bind:value={chatMsg} type="text" />
          <button
            on:click={() => {
              sendChatMessage()
            }}>Send</button
          >
        </form> -->
      </div>
      {#each chatMessageHistory as msg}
        <!-- <p>{msg.timeDate.toLocaleTimeString("sv-SE")} - {msg.user.name}: {msg.message}</p> -->
        <p>{msg.message}</p>
        <!-- <p>HEJ TEST</p> -->
        <!-- <p>{lastMsg}</p> -->
      {/each}
    </div>
  </div>
</Page>

<style>
  .msgInput input {
    width: 100%;
    height: 50%;
  }

  .lobbyWrapper {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    max-width: 85%;
    /* place-items: center; */
  }

  .left,
  .center,
  .right {
    display: grid;
    border: 1px solid rgb(0, 255, 255, 0.2);
    padding: 0.5em;
  }
</style>

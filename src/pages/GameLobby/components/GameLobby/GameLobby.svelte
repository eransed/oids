<script lang="ts">
  //Svelte
  import { fade, slide } from 'svelte/transition'

  //Stores
  import { guestUserName, user, localPlayer, pageHasHeader, isLoggedIn, guestUser, socket, chatMessageHistory, gameSessionId } from '../../../../stores/stores'

  //Interfaces
  import { MessageType, type SpaceObject } from '../../../../lib/interface'

  //Components
  import Page from '../../../../components/page/page.svelte'

  //Services
  import type { ChatMessage, Session } from '../../../../lib/interface'
  import { createSessionId } from '../../../../helpers/util'
  import { activeSessions } from '../../../../lib/services/game/activeSessions'
  import SessionList from './SessionList/SessionList.svelte'

  import { onDestroy, onMount } from 'svelte'
  // import { info, log, warn } from 'mathil'
  import TypeWriter from '../../../../components/typeWriter/TypeWriter.svelte'
  import { navigate } from 'svelte-routing'
  import { alertColors } from '../../../../style/defaultColors'
  import Alert from '../../../../components/alert/Alert.svelte'
  import { info, log, warn } from 'mathil'

  /**
   * Reactive on changes to $user store.
   */
  $: if ($user && $user.name !== $localPlayer.name) {
    $localPlayer.name = $user.name
    $socket.send($localPlayer)
    updateSessions()
  }

  $: if ($isLoggedIn === false) {
    console.log('User logged out - renaming to guest name')
    $localPlayer.name = $guestUser.name
    $socket.send($localPlayer)
    updateSessions()
  }

  $: if ($user) console.log($user)

  $: allReady = false

  pageHasHeader.set(true)

  let sessions: Session[] = []

  function hostSession(forceNewSessionId = false) {
    if ($localPlayer.sessionId.length === 0 || forceNewSessionId === true) {
      $localPlayer.sessionId = $gameSessionId ? $gameSessionId : createSessionId()
      $localPlayer.messageType = MessageType.SESSION_UPDATE
      $localPlayer.isHost = true
      console.log(`Says hello to online players, new session ${$localPlayer.sessionId}`)
      $socket.send($localPlayer)
    } else {
      console.log(`Reusing old session ${$gameSessionId}`)
    }
  }

  function checkReady(): void {
    console.log('Checking which player are ready...')
    let readyPlayers = []

    if (joinedSession?.players) {
      joinedSession?.players.forEach((player) => {
        console.log(`${player.name}: ${player.readyToPlay ? 'ready' : 'not ready'}`)
        if (player.readyToPlay) {
          readyPlayers.push(player)
        }
      })
    }

    if (readyPlayers.length === joinedSession?.players.length) {
      console.log('All players are ready!')
      allReady = true
    } else {
      allReady = false
    }
  }

  function createJoinMsg(session: string) {
    const msg: ChatMessage = {
      message: `Joined ${session}`,
      timeDate: new Date(),
      user: $localPlayer,
      serviceMsg: true,
    }

    return msg
  }

  let pingTimer: ReturnType<typeof setInterval>

  onMount(() => {
    $localPlayer.name = $user ? $user.name : $guestUserName

    $socket.connect().then(() => {
      console.log(`Connected to websocket`)
      hostSession()
    })

    console.log('Adding lobby websocket listener...')

    $socket.addListener(
      (su) => {
        const incomingUpdate = su.dataObject

        if (incomingUpdate.messageType === MessageType.SESSION_UPDATE) {
          console.log(`Got an session update message from ${incomingUpdate.name}`)
          updateSessions()
        } else if (incomingUpdate.messageType === MessageType.CHAT_MESSAGE) {
          const msg = incomingUpdate.lastMessage
          console.log(`${incomingUpdate.name} says: ${msg}`)
          const newMsg: ChatMessage = {
            message: incomingUpdate.lastMessage,
            timeDate: new Date(),
            user: incomingUpdate,
          }
          $chatMessageHistory = [...$chatMessageHistory, newMsg]
        } else if (incomingUpdate.messageType === MessageType.LEFT_SESSION) {
          console.log(`${incomingUpdate.name} left the lobby`)
          setTimeout(() => {
            updateSessions()
          }, 1000)
        } else if (incomingUpdate.messageType === MessageType.PING) {
          // handlePing(incomingUpdate, $socket)
        } else if (incomingUpdate.messageType === MessageType.START_GAME) {
          const sess = incomingUpdate.sessionId
          $localPlayer.isPlaying = true
          console.log(`${incomingUpdate.name}: Starting game with session id ${sess}`)
          $socket.resetListeners()
          navigate(`/play/${sess}`)
        } else if (incomingUpdate.messageType === MessageType.SERVICE) {
          log(`Service message: server version: ${incomingUpdate.serverVersion}`)
          $localPlayer.serverVersion = incomingUpdate.serverVersion
        } else {
          if (incomingUpdate.messageType !== MessageType.GAME_UPDATE) {
            warn(`Message (${MessageType[incomingUpdate.messageType]}) from ${incomingUpdate.name} not handled`)
          }
        }
      },
      () => {}
    )

    setTimeout(() => {
      updateSessions()
    }, 300)
  })

  onDestroy(() => {
    // setReadyToPlay(false)
    $socket.resetListeners()

    if (pingTimer) {
      console.log(`Clears ping timer ${pingTimer}`)
      clearInterval(pingTimer)
    }
  })

  let joinedSession: Session | null
  $: joinedSession = null

  function checkJoinedSession(): void {
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i]
      if (s.id === $localPlayer.sessionId) {
        joinedSession = s
        checkReady()
        // log(`Joined session ${s.id}`)
        return
      }
    }
    console.log('No joined session/host closed the session')
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
        // console.log('Sessions: ', sessions)
      })
      .catch((e) => {
        console.error(`Failed to fetch sessions: ${e}`)
      })
  }

  /**
   * Todos:
   * Share game lobby link -> use as a param to get into lobby directly.
   */

  function joinSession_(otherPlayerWithSession: SpaceObject | null) {
    if (otherPlayerWithSession) {
      console.log(`${$localPlayer.name}: joining session ${otherPlayerWithSession.sessionId} hosted by ${otherPlayerWithSession.name}`)
      $localPlayer.sessionId = otherPlayerWithSession.sessionId
      // send some update that localPlayer joined a/the session
      $localPlayer.messageType = MessageType.SESSION_UPDATE
      $localPlayer.isHost = false
      $chatMessageHistory = []
      $chatMessageHistory = [...$chatMessageHistory, createJoinMsg(otherPlayerWithSession.sessionId)]
      $socket.send($localPlayer)
      setTimeout(() => {
        updateSessions()
      }, 400)
    } else {
      console.error('Join null session not possible...')
    }
  }

  function leaveSession() {
    $chatMessageHistory = []
    console.log(`Leaving session`)
    joinedSession = null
    hostSession(true)
    setTimeout(() => {
      updateSessions()
    }, 400)
    // pingIdArray = []
  }

  let chatMsg: string = ''

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

  function startGame() {
    $localPlayer.messageType = MessageType.START_GAME
    $localPlayer.isPlaying = true
    $socket.send($localPlayer)
    navigate(`/play/${$localPlayer.sessionId}`)
  }

  function toggleReadyToPlay() {
    setReadyToPlay(!$localPlayer.readyToPlay)
  }

  function setReadyToPlay(ready: boolean) {
    console.log(`Sending ${ready ? 'ready' : 'not ready'} to play to session peers`)
    $localPlayer.readyToPlay = ready
    $localPlayer.messageType = MessageType.SESSION_UPDATE
    $socket.send($localPlayer)
    updateSessions()
  }

  function scrollToBottom(): void {
    const messageDiv = document.getElementById('messagesDiv')
    if (messageDiv) {
      setTimeout(() => {
        messageDiv.scrollTop = messageDiv.scrollHeight
      }, 300)
    }
  }
</script>

<Page>
  <Alert severity={'success'} text={`${allReady ? 'All players ready' : ''}`} />
  <div class="lobbyWrapper">
    <div class="left">
      <SessionList joinSession={joinSession_} localPlayer={$localPlayer} {sessions} />
    </div>
    <div class="center">
      {#if joinedSession}
        <div class="sessionInfo">
          <p style={$localPlayer.name === joinedSession.host.name ? 'color: #c89' : 'color: var(--main-text-color)'}>
            Host: {joinedSession.host.name}
            {joinedSession.host.readyToPlay ? '✅' : ''}
          </p>
          <br />
          {#if joinedSession.players.length > 1}
            <p>Players</p>
          {/if}
          {#each joinedSession.players as player}
            {#if !player.isHost}
              <p style={$localPlayer.name === player.name ? 'color: #c89' : 'color: var(--main-text-color)'}>
                {player.name}
                <!-- {getPlayerPing(player)} - -->

                {player.readyToPlay ? '✅' : ''}
              </p>
            {/if}
          {/each}
          {#if allReady}
            <p>All players ready!</p>
          {/if}
        </div>
        <div class="buttonWrapper">
          <button
            style={`background-color: ${alertColors.warning}`}
            on:click={() => {
              leaveSession()
            }}>Leave session</button
          >

          <button style={`background-color: ${$localPlayer.readyToPlay ? alertColors.success : alertColors.info}`} on:click={() => toggleReadyToPlay()}
            >{$localPlayer.readyToPlay ? 'Ready ✅' : 'Ready up!'}</button
          >
          <button
            style={`background-color: ${allReady ? alertColors.info : alertColors.error}`}
            disabled={!allReady}
            on:click={() => {
              startGame()
            }}
            >Start game!
          </button>
        </div>
      {:else}
        <p>No session joined</p>
      {/if}
    </div>
    <div class="right">
      <p style="margin-left: 0.5em">Chat - {joinedSession?.id}</p>

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

  .left {
    min-width: 22em;
  }

  .left,
  .center,
  .right {
    display: grid;
    margin: 0.5em;
    border-radius: 8px;
    color: var(--main-text-color);
    padding: 0.5em;
    line-break: anywhere;
    background-color: var(--main-card-color);
  }

  .center,
  .right {
    min-width: 13em;
  }

  .center {
    grid-template-rows: 1fr auto;
  }

  .right {
    grid-template-rows: 1fr auto auto;
  }

  .messages {
    max-height: 14em;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 100%;
    padding: 0.5em;
  }

  .center button {
    width: 100%;
    border: none;
    padding: 0.5em;
    margin: 0.2em;
    /* border: none;
    background: none; */
    /* color: var(--main-text-color); */
  }

  .buttonWrapper {
    display: flex;
    flex-flow: row;
    min-width: 34ch;
    width: 80%;
  }

  .sessionInfo {
    max-height: 235px;
    overflow-x: auto;
  }

  @media screen and (max-width: 1200px) {
    .sessionInfo p {
      padding: 0.2em;
    }

    .sessionInfo {
      max-height: 33vh;
      overflow-x: auto;
    }

    .left,
    .center,
    .right {
      min-width: unset;
      padding-left: 0px;
      margin-left: 0px;
    }

    .lobbyWrapper {
      width: 100%;
    }
    .left {
      grid-column-start: 1;
      grid-column-end: 2;
    }
    .center {
      grid-column-start: 1;
      grid-column-end: 2;
      grid-row-start: 2;
      grid-row-end: 4;
    }
    .right {
      grid-row-start: 1;
      grid-row-end: 4;
      grid-column-start: 2;
      grid-column-end: 4;
      max-height: 22em;
    }
  }

  @media screen and (max-width: 750px) {
    .lobbyWrapper {
      grid-template-columns: auto;
    }

    .left {
      grid-column-start: 1;
      grid-column-end: 1;
    }
    .center {
      grid-column-start: 1;
      grid-column-end: 2;
      grid-row-start: 2;
      grid-row-end: 4;
    }
    .right {
      grid-row-start: 5;
      grid-row-end: 5;
      grid-column-start: 1;
      grid-column-end: 1;
      max-height: 22em;
    }
    .lobbyWrapper {
      width: 100%;
      position: relative;
      height: 100vh;
    }

    .right {
      max-height: none;
      height: 300px;
      width: 95%;
    }

    .messages {
      height: 100%;
    }
  }

  @media screen and (max-width: 750px) and (max-height: 400px) {
    .lobbyWrapper {
      grid-template-columns: auto;
    }

    .left {
      grid-column-start: 1;
      grid-column-end: 3;
    }
    .center {
      grid-column-start: 1;
      grid-column-end: 3;
      grid-row-start: 2;
      grid-row-end: 2;
    }
    .right {
      grid-row-start: 3;
      grid-row-end: 3;
      grid-column-start: 1;
      grid-column-end: 3;
      max-height: 300px;
      width: 95%;
      overflow-x: auto;
    }
    .lobbyWrapper {
      width: 100%;
      position: relative;
      height: fit-content;
      overflow: auto;
    }

    .messages {
      height: 100%;
    }
  }
</style>

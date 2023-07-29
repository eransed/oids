<script lang="ts">
 //Svelte
 import { fade } from 'svelte/transition'

 //Stores
 import { guestUserName, user, localPlayer, pageHasHeader, isLoggedIn, guestUser } from '../../../../stores/stores'

 //Interfaces

 import { MessageType, type SpaceObject } from '../../../../lib/interface'

 //Components

 import Page from '../../../../components/page/page.svelte'

 //Services
 import type { Session } from '../../../../lib/interface'

 import { getWsUrl } from '../../../../lib/websocket/webSocket'
 import { OidsSocket } from '../../../../lib/websocket/ws'
 import { createSessionId } from '../../../../helpers/util'
 import { activeSessions } from '../../../../lib/services/game/activeSessions'
 import SessionList from './SessionList/SessionList.svelte'

 import { onDestroy, onMount } from 'svelte'
 import { info, log, usPretty, warn } from 'mathil'
 import { v4 as uuidv4 } from 'uuid'
 import TypeWriter from '../../../../components/typeWriter/TypeWriter.svelte'

 /**
  * Reactive on changes to $user store.
  */
 $: if ($user && $user.name !== $localPlayer.name) {
  info('Updating guestname name in session to username after login completed.')
  $localPlayer.name = $user.name
  sock.send($localPlayer)
  updateSessions()
 }

 $: if ($isLoggedIn === false) {
  info('User logged out - renaming to guestname')
  $localPlayer.name = $guestUser.name
  sock.send($localPlayer)
  updateSessions()
 }

 $: if ($user) console.log($user)

 $: allReady = false

 pageHasHeader.set(true)

 let sessions: Session[] = []

 const sock: OidsSocket = new OidsSocket(getWsUrl())
 let chatMessageHistory: ChatMessage[] = []

 function hostSession() {
  $localPlayer.sessionId = createSessionId()
  $localPlayer.messageType = MessageType.SESSION_UPDATE
  $localPlayer.isHost = true
  info(`Says hello to online players, new session ${$localPlayer.sessionId}`)
  sock.send($localPlayer)
 }

 function checkReady(): void {
  let readyPlayers = []

  if (joinedSession?.players) {
   joinedSession?.players.forEach((player) => {
    if (player.readyToPlay) {
     readyPlayers.push(player)
    }
   })
  }

  if (readyPlayers.length === joinedSession?.players.length) {
   allReady = true
  } else allReady = false
 }

 interface Ping {
  otherClientName: string
  sent: Date
  id: string
  latencyUs: number
  responded: boolean
 }

 let pingIdArray: Ping[] = []
 const pingArrayMaxSize = 10

 function averageLatencyUs() {
  let sum = 0
  let size = 0
  pingIdArray.forEach((p) => {
   if (p.latencyUs > 0) {
    sum += p.latencyUs
    size++
   }
  })
  if (size > 0) {
   return sum / size
  } else {
   return -1
  }
 }

 function handlePing(so: SpaceObject, sock: OidsSocket): void {
  if (so.messageType !== MessageType.PING) return

  if (so.ping === true) {
   info(`ping from: ${so.name}, ttl=${so.ttl}, rtt=${so.rtt}ms, hops=${so.hops}`)
   so.ping = false
   so.pingResponse = true
   so.hops++
   sock.send(so)
  } else if (so.pingResponse === true) {
   checkJoinedSession()

   for (let i = 0; i < pingIdArray.length; i++) {
    const p = pingIdArray[i]
    if (p.id === so.pingId) {
     p.latencyUs = (new Date().valueOf() - p.sent.valueOf()) * 1000
     p.responded = true
     info(`ping response: ${p.id}, sent: ${p.sent}, latency: ${usPretty(p.latencyUs)}, average=${usPretty(averageLatencyUs())}`)
     if (pingIdArray.length > pingArrayMaxSize) {
      const diff = pingIdArray.length - pingArrayMaxSize
      if (diff > 1) {
       pingIdArray.splice(0, diff)
      } else {
       pingIdArray.splice(0, 1)
      }
     }
     return
    }
   }
   warn(`Unhandled ping response:`)
   console.log(so)
  }
 }

 function ping(so: SpaceObject, sock: OidsSocket): void {
  info(`PING`)
  so.ping = true
  so.pingResponse = false
  so.pingId = uuidv4()
  so.messageType = MessageType.PING
  pingIdArray.push({
   otherClientName: so.name,
   sent: new Date(),
   id: so.pingId,
   latencyUs: -1,
   responded: false,
  })
  pingIdArray.forEach((p, idx) => {
   const currentLatencyUs = (new Date().valueOf() - p.sent.valueOf()) * 1000
   if (currentLatencyUs > 100) {
    warn(`high latency: ${usPretty(currentLatencyUs)}`)
    pingIdArray.splice(idx, 1)
    checkJoinedSession()
   }
  })
  sock.send(so)
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
   user: $localPlayer,
   serviceMsg: true,
  }

  return msg
 }

 let pingTimer: ReturnType<typeof setInterval>

 onMount(() => {
  $localPlayer.name = $user ? $user.name : $guestUserName

  sock.connect().then(() => {
   info(`Connected to websocket`)
   hostSession()
  })

  sock.addListener((su) => {
   const incomingUpdate = su.spaceObject

   if (incomingUpdate.messageType === MessageType.SESSION_UPDATE) {
    log('Update')
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
   } else if (incomingUpdate.messageType === MessageType.LEFT_SESSION) {
    warn(`${incomingUpdate.name} left the lobby`)
    setTimeout(() => {
     updateSessions()
    }, 1000)
   } else if (incomingUpdate.messageType === MessageType.PING) {
    handlePing(incomingUpdate, sock)
   } else {
    warn(`Message (${incomingUpdate.messageType}) from ${incomingUpdate.name} not handled`)
    console.log(incomingUpdate)
   }
  })

  setTimeout(() => {
   updateSessions()
  }, 300)

  // pingTimer = setInterval(() => {
  //   ping(localPlayer, sock)
  // }, 3000)
 })

 onDestroy(() => {
  info(`Leaving session, says goodbye...`)
  $localPlayer.messageType === MessageType.LEFT_SESSION
  sock.send($localPlayer)

  if (pingTimer) {
   info(`Clears ping timer ${pingTimer}`)
   clearInterval(pingTimer)
  }

  setTimeout(() => {
   info(`Disconnecting from websocket`)
   sock.disconnect()
  }, 200)
 })

 let joinedSession: Session | null
 $: joinedSession = null

 function checkJoinedSession(): void {
  for (let i = 0; i < sessions.length; i++) {
   const s = sessions[i]
   if (s.id === $localPlayer.sessionId) {
    joinedSession = s
    checkReady()
    log(`Joined session ${s.id}`)
    return
   }
  }
  warn('No joined session')
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
    console.log('Sessions: ', sessions)
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
   log(`${$localPlayer.name}: joining session ${otherPlayerWithSession.sessionId} hosted by ${otherPlayerWithSession.name}`)
   $localPlayer.sessionId = otherPlayerWithSession.sessionId
   // send some update that localPlayer joined a/the session
   $localPlayer.messageType = MessageType.SESSION_UPDATE
   $localPlayer.isHost = false
   chatMessageHistory = []
   chatMessageHistory = [...chatMessageHistory, createJoinMsg(otherPlayerWithSession.sessionId)]
   sock.send($localPlayer)
   setTimeout(() => {
    updateSessions()
   }, 400)
  } else {
   console.error('Join null session not possible...')
  }
 }

 function leaveSession() {
  log(`Leaving session`)
  joinedSession = null
  hostSession()
  setTimeout(() => {
   updateSessions()
  }, 400)
  pingIdArray = []
 }

 let chatMsg: string = ''

 function sendRawChatMessage(msgStr: string) {
  const chatMessage: ChatMessage = {
   message: msgStr,
   user: $localPlayer,
   timeDate: new Date(),
  }
  chatMessageHistory.push(chatMessage)
  chatMessageHistory = chatMessageHistory

  $localPlayer.messageType = MessageType.CHAT_MESSAGE
  $localPlayer.lastMessage = msgStr
  sock.send($localPlayer)
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

 function formatDate(date: Date) {
  const f = new Intl.DateTimeFormat('en-eu', {
   timeStyle: 'medium',
   hour12: false,
  })

  return f.format(date)
 }

 function getPlayerPing(so: SpaceObject): string {
  let sumUs = 0
  let size = 0

  for (let i = 0; i < pingIdArray.length; i++) {
   const p = pingIdArray[i]
   if (so.name === p.otherClientName && p.responded === true) {
    sumUs += p.latencyUs
    size++
   }
  }

  if (size > 0) {
   return `(ping: ${usPretty(sumUs / size)})`
  }
  return ''
 }

 function readyToPlay() {
  $localPlayer.readyToPlay = !$localPlayer.readyToPlay
  $localPlayer.messageType = MessageType.SESSION_UPDATE
  sock.send($localPlayer)
  updateSessions()
 }

 function scrollToBottom(): void {
  const messageDiv = document.getElementById('messagesDiv')
  if (messageDiv) {
   setTimeout(() => {
    messageDiv.scrollTop = messageDiv.scrollHeight
    log('scrolled')
   }, 300)
  }
 }
</script>

<Page>
 <div class="lobbyWrapper">
  <div class="left">
   <SessionList joinSession={joinSession_} localPlayer={$localPlayer} {sessions} />
  </div>
  <div class="center">
   {#if joinedSession}
    <div class="sessionInfo">
     <p style={$localPlayer.name === joinedSession.host.name ? 'color: #c89' : 'color: #fff'}>
      Host: {joinedSession.host.name}
      {joinedSession.host.readyToPlay ? '✅' : ''}
     </p>
     {#if joinedSession.players.length > 1}
      <p>Players</p>
     {/if}
     {#each joinedSession.players as player}
      {#if !player.isHost}
       <p style={$localPlayer.name === player.name ? 'color: #c89' : 'color: #fff'}>
        {player.name}
        <!-- {getPlayerPing(player)} - -->

        {player.readyToPlay ? '✅' : ''}
       </p>
      {/if}
     {/each}
    </div>
    {#if allReady}
     <p>All players ready!</p>
    {/if}
    <button on:click={() => readyToPlay()}>{$localPlayer.readyToPlay ? 'Ready' : 'Not ready'}</button>
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

   <div class="messages" id="messagesDiv">
    {#each chatMessageHistory as msg}
     {#if msg.serviceMsg}
      <span style="font-size: 0.8rem; font-style: italic; opacity: 0.5;">{msg.message}</span>
     {:else}
      <div in:fade={{ delay: 100 }}>
       <p style="margin-bottom: 1rem;">
        <span style="font-size: 0.65rem; color: #cdcdcd;">
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

  padding: 0.5em;
  line-break: anywhere;
  background-color: rgba(255, 255, 255, 0.05);
 }

 .center,
 .right {
  grid-template-rows: 1fr auto;
  min-width: 15em;
 }

 .messages {
  max-height: 14em;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
 }

 @media screen and (max-width: 1000px) {
  .left,
  .center,
  .right {
   min-width: none;
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

 @media screen and (max-width: 600px) {
  .left,
  .center,
  .right {
   grid-column-start: 1;
   grid-column-end: 4;
   width: 100%;
  }
  .lobbyWrapper {
   width: 100%;
   position: relative;
   height: 100vh;
  }

  .right {
   bottom: 0;
   left: 0;
   margin: auto;
   max-height: none;
  }

  .messages {
   height: 100%;
  }
 }
</style>

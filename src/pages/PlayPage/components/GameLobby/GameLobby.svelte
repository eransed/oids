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
  import { info, log, usPretty, warn } from "mathil"
  import { v4 as uuidv4 } from "uuid"

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })

  let sessions: Session[] = []
  const localPlayer = createSpaceObject($user ? $user.name : $guestUserName)
  const sock: OidsSocket = new OidsSocket(getWsUrl())
  let chatMessageHistory: ChatMessage[] = []

  function hostSession() {
    localPlayer.sessionId = createSessionId()
    localPlayer.messageType = MessageType.SESSION_UPDATE
    localPlayer.isHost = true
    info(`Says hello to online players, new session ${localPlayer.sessionId}`)
    sock.send(localPlayer)
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
      user: localPlayer,
      serviceMsg: true,
    }

    return msg
  }

  let pingTimer: ReturnType<typeof setInterval>

  onMount(() => {
    sock.connect().then(() => {
      info(`Connected to websocket`)
      hostSession()
    })

    sock.addListener((su) => {
      const incomingUpdate = su.spaceObject

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

    pingTimer = setInterval(() => {
      ping(localPlayer, sock)
    }, 3000)
  })

  onDestroy(() => {
    info(`Leaving session, says goodbye...`)
    localPlayer.messageType === MessageType.LEFT_SESSION
    sock.send(localPlayer)

    if (pingTimer) {
      info(`Clears ping timer ${pingTimer}`)
      clearInterval(pingTimer)
    }

    setTimeout(() => {
      info(`Disconnecting from websocket`)
      sock.disconnect()
    }, 2000)
  })

  let joinedSession: Session | null
  $: joinedSession = null

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
    const ms = ("" + d.getMilliseconds()).padStart(3, "0")
    return `${d.toLocaleString("sv-SE")}.${ms}`
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
      }, 400)
    } else {
      console.error("Join null session not possible...")
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
    return ""
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
            <p style="color: #c89">{player.name} {getPlayerPing(player)}</p>
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
              <br />
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

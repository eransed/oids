<script lang="ts">
  //Stores
  import { guestUser, userStore, localPlayerStore, pageHasHeaderStore, socketStore, chatMsgHistoryStore } from '../../stores/stores'

  //Interfaces
  import { MessageType, type SpaceObject } from '../../lib/interface'

  //Components
  import Page from '../../components/page/page.svelte'
  import Ships from '../ProfilePage/Ships.svelte'
  import Chat from '../../components/chat/chat.svelte'

  //Services
  import type { ChatMessage, ServerUpdate, Session, Ship } from '../../lib/interface'
  import { createSessionId } from '../../utils/utils'
  import { getActiveSessions } from '../../lib/services/game/activeSessions'
  import SessionList from './components/SessionList/SessionList.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { info, log, warn } from 'mathil'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import Button90 from '../../components/menu/Button90.svelte'

  //Assets
  import { Icons } from '../../style/icons'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'
  // import type { Ship } from '@prisma/client'
  import AddShip from '../ProfilePage/AddShip.svelte'
  import ShipCardInfo from '../../components/ships/ShipCardInfo.svelte'
  import { worldStartPosition } from '../../lib/constants'
  import { fade, fly } from 'svelte/transition'
  import { handleChatUpdate } from '../../lib/gameModes/handlers/incomingDataHandlers/handleChatUpdate'
  import { handleIncomingChatMessage } from './handlers/handleChatMessages'
  import Sessions from './components/Sessions/Sessions.svelte'
  import ShipChoice from './components/ShipChoice/ShipChoice.svelte'

  pageHasHeaderStore.set(true)

  let sessions: Session[] = []

  function createJoinMsg(session: string) {
    const msg: ChatMessage = {
      message: `Joined ${session}`,
      timeDate: new Date(),
      user: $localPlayerStore,
      serviceMsg: true,
    }

    return msg
  }

  let pingTimer: ReturnType<typeof setInterval>
  let chosenShip: Ship
  let shipModalOpen: boolean = false

  async function initLobbySocket() {
    return new Promise<void>((resolve, reject) => {
      $localPlayerStore.name = $userStore ? $userStore.name : $guestUser.name

      // if ($userStore) {
      //   if ($userStore.ships) {
      //     $localPlayerStore.ship = $userStore.ships[0]
      //   }
      // }

      $socketStore.connect().then(() => {
        console.log(`Connected to websocket`)
      })

      console.log('Adding lobby websocket listener...')

      $socketStore
        .addListener(
          (su) => {
            const incomingUpdate = su.dataObject

            switch (su.dataObject.messageType) {
              case MessageType.SESSION_UPDATE:
                console.log(`Got an session update message from ${incomingUpdate.name}`)
                updateSessions()
                break
              case MessageType.SERVICE:
                log(`Service message: server version: ${incomingUpdate.serverVersion}`)
                $localPlayerStore.serverVersion = incomingUpdate.serverVersion
                break
              case MessageType.CHAT_MESSAGE:
                handleIncomingChatMessage(incomingUpdate)
                break
              default:
                warn(`Message (${MessageType[incomingUpdate.messageType]}) from ${incomingUpdate.name} not handled`)
                break
            }
          },
          (su) => {
            console.log(su)
          },
        )
        .then(() => {
          updateSessions()
          resolve()
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  onMount(async () => {
    const storedShipJson = localStorage.getItem('chosenShip')
    await initLobbySocket()

    if (storedShipJson && $userStore) {
      console.log('storedShip', storedShipJson)
      const storedShip = JSON.parse(storedShipJson)
      if (storedShip) {
        $userStore.ships.find((ship) => {
          if (ship.id === storedShip.id) {
            chosenShip = ship
            $localPlayerStore.ship = ship
            console.log('ship:', $localPlayerStore.ship)

            return
          }
        })
      }
    }
  })

  onDestroy(() => {
    // setReadyToPlay(false)
    $socketStore.resetListeners()

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
      if (s.id === $localPlayerStore.sessionId) {
        joinedSession = s
        // log(`Joined session ${s.id}`)
        return
      }
    }
  }

  async function updateSessions() {
    await getActiveSessions()
      .then((s) => {
        if (s.status === 200) {
          sessions = s.data
          checkJoinedSession()
        } else {
          console.error(`Sessions endpoint returned status ${s.status} ${s.statusText}`)
        }
      })
      .catch((e) => {
        console.error(`Failed to fetch sessions: ${e}`)
      })
  }

  /**
   * Todos:
   * Share game lobby link -> use as a param to get into lobby directly.
   */

  function joinSession_(sessionId: string) {
    if (sessionId) {
      console.log($localPlayerStore)
      console.log(`${$localPlayerStore.name}: joining session ${sessionId}`)
      $localPlayerStore.sessionId = sessionId
      // send some update that localPlayer joined a/the session
      $localPlayerStore.messageType = MessageType.SESSION_UPDATE
      $localPlayerStore.isHost = false
      $chatMsgHistoryStore = []
      $chatMsgHistoryStore = [...$chatMsgHistoryStore, createJoinMsg(sessionId)]
      $socketStore.send($localPlayerStore)
      setTimeout(() => {
        updateSessions()
      }, 400)
    } else {
      console.error('Join null session not possible...')
    }
  }

  function startGame(offlineGameId?: string) {
    //Init game if localplayer started it
    if (offlineGameId) {
      $localPlayerStore.sessionId = offlineGameId
    }

    $localPlayerStore.isPlaying = true
    $socketStore.send($localPlayerStore)
    navigate(`/play/${$localPlayerStore.sessionId}`)
  }
</script>

<Page>
  <div class="lobbyWrapper">
    <div class="left">
      <Sessions {joinSession_} {startGame} {sessions} />
    </div>
    {#if joinedSession}
      <div class="center" in:fly={{ duration: 500, x: -500 }}>
        <ShipChoice {joinedSession} />
        <div class="buttonWrapper">
          <Button90
            borderBottom
            mouseTracking
            buttonConfig={{
              buttonText: 'Play',
              clickCallback: () => startGame(),
              selected: false,
            }}
          />
        </div>
      </div>
      <div class="right" in:fly={{ duration: 500, delay: 350, x: -500 }}>
        <Chat joinedSessionId={joinedSession?.id} />
      </div>
    {/if}
  </div>
</Page>

<style>
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
    /* grid-template-columns: 1fr auto; */
    grid-template-rows: auto auto;
  }

  .right {
    grid-template-rows: 1fr auto auto;
    width: 350px;
  }

  .buttonWrapper {
    justify-self: flex-end;
    align-self: flex-end;
    margin-bottom: 1em;
  }

  @media screen and (max-width: 1200px) {
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
      top: 1.5em;
      width: 100%;
      position: relative;
      height: 100vh;
      grid-template-columns: auto;
      zoom: 0.8;
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

    .right {
      max-height: none;
      height: 300px;
      width: 95%;
    }
  }

  @media screen and (max-width: 750px) and (max-height: 400px) {
    .lobbyWrapper {
      grid-template-columns: auto;
      zoom: 0.5;
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
  }
</style>

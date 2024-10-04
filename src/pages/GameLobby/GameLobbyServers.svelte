<script lang="ts">
  //Stores
  import { guestUser, userStore, localPlayerStore, pageHasHeaderStore, socketStore, chatMsgHistoryStore } from '../../stores/stores'

  //Interfaces
  import { MessageType } from '../../lib/interface'

  //Components
  import Page from '../../components/page/page.svelte'
  import Chat from '../../components/chat/chat.svelte'

  //Services
  import type { ChatMessage, Session, Ship } from '../../lib/interface'
  import { getActiveSessions } from '../../lib/services/game/activeSessions'

  import { onDestroy, onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import Button90 from '../../components/menu/Button90.svelte'

  //Assets
  import { Icons } from '../../style/icons'
  // import type { Ship } from '@prisma/client'
  import { fly } from 'svelte/transition'
  import { handleIncomingChatMessage } from './handlers/handleChatMessages'
  import Sessions from './components/Sessions/Sessions.svelte'
  import ShipChoice from './components/ShipChoice/ShipChoice.svelte'
  import Info from '../../components/info/info.svelte'
  import { getProfile } from '../../lib/services/user/profile'
  import { handleAxiosError } from '../../lib/services/utils/errorHandler'
  import { logInfo } from '../../components/alert/alertHandler'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import SessionList from './components/SessionList/SessionList.svelte'
  import SessionListRow from './components/SessionList/SessionListRow.svelte'

  pageHasHeaderStore.set(true)

  $: sessions = [] as Session[]

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
  let loadingSessions = true

  async function initLobbySocket() {
    return new Promise<void>((resolve, reject) => {
      $localPlayerStore.name = $userStore ? $userStore.name : $guestUser.name

      // if ($userStore) {
      //   if ($userStore.ships) {
      //     $localPlayerStore.ship = $userStore.ships[0]
      //   }
      // }

      try {
        $socketStore.connect()
        logInfo('Connected to Websocket')
      } catch (err) {
        //error handled by ws.ts
      }

      logInfo('Adding lobby websocket listener...')

      $socketStore
        .addListener(
          (su) => {
            const incomingUpdate = su.dataObject
            console.log({ msgtype: MessageType[su.dataObject.messageType], so: su.dataObject })

            switch (su.dataObject.messageType) {
              case MessageType.SESSION_UPDATE:
                logInfo(`Got an session update message from ${incomingUpdate.name}`)
                updateSessions()
                break
              case MessageType.SERVICE:
                logInfo(`Service message: server version: ${incomingUpdate.serverVersion}`)
                $localPlayerStore.serverVersion = incomingUpdate.serverVersion
                break
              case MessageType.CHAT_MESSAGE:
                handleIncomingChatMessage(incomingUpdate, $localPlayerStore.name)
                break
              default:
                // logWarning(`Message (${MessageType[incomingUpdate.messageType]}) from ${incomingUpdate.name} not handled`)
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
    if ($userStore) {
      await getProfile()
    }

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
    console.log('onMount lobby', $localPlayerStore)
  })

  onDestroy(() => {
    // setReadyToPlay(false)
    $socketStore.resetListeners()

    console.log('destroying lobby')
    if (pingTimer) {
      logInfo(`Clears ping timer ${pingTimer}`)
      clearInterval(pingTimer)
    }
  })

  $: joinedSession = null as Session | null

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
    try {
      if (sessions.length === 0) {
        loadingSessions = true
      }
      sessions = await getActiveSessions()
      checkJoinedSession()
      loadingSessions = false
    } catch (e) {
      loadingSessions = false
    }
  }

  /**
   * Todos:
   * Share game lobby link -> use as a param to get into lobby directly.
   */

  async function joinSession_(sessionId: string) {
    try {
      logInfo(`${$localPlayerStore.name}: joining session ${sessionId}`)

      $localPlayerStore.sessionId = sessionId

      $localPlayerStore.messageType = MessageType.SESSION_UPDATE

      // send some update that localPlayer joined a/the session

      $chatMsgHistoryStore = []
      $chatMsgHistoryStore = [...$chatMsgHistoryStore, createJoinMsg(sessionId)]
      // console.log($localPlayerStore)
      $socketStore.send($localPlayerStore)
      updateSessions()
    } catch (e) {
      handleAxiosError(e)
    }
  }

  function startGame(offlineGameId?: string) {
    //Init game if localplayer started it
    if (offlineGameId) {
      $localPlayerStore.sessionId = offlineGameId
    }

    $localPlayerStore.isPlaying = true

    navigate(`/play/${$localPlayerStore.sessionId}`)
  }
</script>

<Page>
  <div class="lobbyWrapper">
    {#if joinedSession}
      <div class="actionList">
        <Button90
          addInfo="Back to servers"
          icon={Icons.Exit}
          buttonConfig={{
            buttonText: 'Back to servers',
            clickCallback: () => {
              joinedSession = null
              $localPlayerStore.sessionId = ''
              $localPlayerStore.messageType = MessageType.SESSION_UPDATE
              $socketStore.send($localPlayerStore)
              updateSessions()
            },
            selected: false,
          }}
        />

        <tbody class="playerList" in:fly={{ delay: 0, duration: 750, x: -1000 }}>
          <th>
            Online({joinedSession.players.length})
          </th>

          {#each joinedSession.players.reverse() as player, i}
            <tr class="playerListItem" in:fly|global={{ delay: (i + 1) * 300, duration: 750, x: -1000 }} out:fly={{ duration: 750, x: -1000 }}>
              <Button90 borderBottom buttonConfig={{ buttonText: '🚀' + player.name, clickCallback: () => console.log(player), selected: false }} />
            </tr>
          {/each}
        </tbody>
      </div>
      <div class="center" in:fly={{ duration: 500, x: -500 }}>
        <Info text={`Shipstation @ ${joinedSession.id}(${joinedSession.players.length})`} />
        <ShipChoice />
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
      <div class="right" in:fly={{ duration: 500, x: 500 }}>
        <Chat joinedSessionId={joinedSession?.id} possibleMentions={joinedSession.players.filter((v) => v.name !== $localPlayerStore.name)} />
      </div>
    {:else}
      <div class="left" in:fly={{ duration: 500, x: -500 }}>
        {#if !loadingSessions}
          <Sessions {joinSession_} {startGame} {sessions} />
        {:else}
          <CircularSpinner ship text="Locating planets..." />
        {/if}
      </div>
    {/if}
  </div>
</Page>

<style>
  .lobbyWrapper {
    justify-content: center;
    display: flex;
    grid-template-columns: 1fr 2fr 1fr;
    max-width: 85%;
    min-height: 20em;
    /* max-height: 20em; */
    /* place-items: center; */
  }

  .actionList {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 1em;
  }

  .playerList {
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    gap: 0.3em;
  }

  .playerListItem {
    opacity: 0.5;
    transition: all 500ms;
  }

  .playerListItem:hover {
    opacity: 1;
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
    /* background-color: var(--main-card-color); */
  }

  .right {
    min-width: 13em;
  }

  .center {
    /* grid-template-columns: 1fr auto; */
    grid-template-rows: auto auto;
    border-left: 1px solid var(--main-accent2-color);
    border-radius: 0;
    min-width: 30em;
  }

  .right {
    grid-template-rows: 1fr auto auto;
    width: 350px;
    border-left: 1px solid var(--main-accent2-color);
    border-radius: 0;
    /* background-color: var(--main-card-color); */
  }

  .buttonWrapper {
    position: absolute;
    align-self: flex-end;
    justify-self: flex-end;
    /* justify-self: flex-end;
    align-self: flex-end;
    margin-bottom: 1em; */
  }

  @media screen and (max-width: 1200px) {
    .lobbyWrapper {
      width: 100%;
      top: 1.5em;
    }

    .left,
    .center,
    .right {
      min-width: 13em;
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

    .left,
    .center,
    .right {
      min-width: 13em;
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

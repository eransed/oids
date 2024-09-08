<script lang="ts">
  //Stores
  import { guestUserNameStore, userStore, localPlayerStore, pageHasHeaderStore, isLoggedInStore, guestUserStore, socketStore, chatMsgHistoryStore } from '../../stores/stores'

  //Interfaces
  import { MessageType, type SpaceObject } from '../../lib/interface'

  //Components
  import Page from '../../components/page/page.svelte'
  import Ships from '../ProfilePage/Ships.svelte'
  import Chat from '../../components/chat/chat.svelte'

  //Services
  import type { ChatMessage, ChosenShip, Session, Ship } from '../../lib/interface'
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

  /**
   * Reactive on changes to $user store.
   */
  $: if ($userStore && $userStore.name !== $localPlayerStore.name) {
    $localPlayerStore.name = $userStore.name
    info(`sending loc player`)
    setTimeout(() => {
      $socketStore.send($localPlayerStore)
    }, 500)
    if ($userStore.ships.length === 1) {
      $localPlayerStore.ship = createChosenShip($userStore.ships[0])
      console.log($userStore.ships)
      setTimeout(() => {
        $socketStore.send($localPlayerStore)
      }, 600)
    } else {
      shipModalOpen = true
    }

    setTimeout(() => {
      updateSessions()
    }, 600)
  }

  $: if ($isLoggedInStore === false) {
    console.log('User logged out - renaming to guest name')
    $localPlayerStore.name = $guestUserStore.name
    setTimeout(() => {
      $socketStore.send($localPlayerStore)
      log('$: if ($isLoggedIn === false)')
      updateSessions()
    }, 700)
  }

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
      $localPlayerStore.name = $userStore ? $userStore.name : $guestUserNameStore
      if (!$isLoggedInStore) {
        $localPlayerStore.ship = {
          name: '',
          shipVariant: 0,
          level: 0,
          userId: '',
          id: '',
          experience: 0,
        }
      }

      $socketStore.connect().then(() => {
        console.log(`Connected to websocket`)
        // hostSession()
      })

      console.log('Adding lobby websocket listener...')

      $socketStore
        .addListener(
          (su) => {
            const incomingUpdate = su.dataObject

            if (incomingUpdate.messageType === MessageType.SESSION_UPDATE) {
              console.log(`Got an session update message from ${incomingUpdate.name}`)
              updateSessions()
            } else if (incomingUpdate.messageType === MessageType.CHAT_MESSAGE) {
              console.log(incomingUpdate)
              const msg = incomingUpdate.lastMessage
              console.log(`${incomingUpdate.name} says: ${msg}`)
              const newMsg: ChatMessage = {
                message: incomingUpdate.lastMessage,
                timeDate: new Date(),
                user: incomingUpdate,
              }
              $chatMsgHistoryStore = [...$chatMsgHistoryStore, newMsg]
            } else if (incomingUpdate.messageType === MessageType.LEFT_SESSION) {
              console.log(`${incomingUpdate.name} left the lobby`)
            } else if (incomingUpdate.messageType === MessageType.PING) {
              // handlePing(incomingUpdate, $socket)
            } else if (incomingUpdate.messageType === MessageType.START_GAME) {
              //Game init started by other player
              const sess = incomingUpdate.sessionId
              $localPlayerStore.isPlaying = true
              info(`Resetting local player position to world start position`)
              $localPlayerStore.cameraPosition = worldStartPosition
              console.log(`${incomingUpdate.name}: Starting game with session id ${sess}`)
              $socketStore.resetListeners()
              navigate(`/play/${sess}`)
            } else if (incomingUpdate.messageType === MessageType.SERVICE) {
              log(`Service message: server version: ${incomingUpdate.serverVersion}`)
              $localPlayerStore.serverVersion = incomingUpdate.serverVersion
            } else {
              if (incomingUpdate.messageType !== MessageType.GAME_UPDATE) {
                warn(`Message (${MessageType[incomingUpdate.messageType]}) from ${incomingUpdate.name} not handled`)
              }
            }
          },
          () => {},
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

  let showLobby = false

  function createChosenShip(ship: Ship): ChosenShip {
    const chosenShip: ChosenShip = {
      name: ship.name,
      userId: ship.userId,
      level: ship.level,
      shipVariant: ship.variant,
      id: ship.id,
      experience: ship.experience,
    }
    return chosenShip
  }

  onMount(() => {
    const storedShipJson = localStorage.getItem('chosenShip')

    if (storedShipJson && $userStore) {
      console.log('storedShip', storedShipJson)
      const storedShip = JSON.parse(storedShipJson)
      if (storedShip) {
        $userStore.ships.find((ship) => {
          if (ship.id === storedShip.id) {
            chosenShip = ship
            $localPlayerStore.ship = createChosenShip(ship)
            console.log('ship:', $localPlayerStore.ship)

            return
          }
        })
      }
    }

    if ($isLoggedInStore && $userStore && !storedShipJson) {
      shipModalOpen = true
      if ($userStore.ships.length > 0) {
        $localPlayerStore.ship = createChosenShip($userStore.ships[0])
      }
    } else {
      initLobbySocket().then(() => {
        showLobby = true
        updateSessions()
      })
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

  function toggleReadyToPlay() {
    setReadyToPlay(!$localPlayerStore.readyToPlay)
  }

  function setReadyToPlay(ready: boolean) {
    console.log(`Sending ${ready ? 'ready' : 'not ready'} to play to session peers`)
    $localPlayerStore.readyToPlay = ready
    $localPlayerStore.messageType = MessageType.SESSION_UPDATE
    $socketStore.send($localPlayerStore)
    updateSessions()
  }

  function handleChosenShip(ship: Ship) {
    console.log('clickedshipcallback')
    shipModalOpen = false
    chosenShip = ship
    $localPlayerStore.ship = {
      level: ship.level,
      name: ship.name,
      userId: ship.userId,
      shipVariant: ship.variant,
      id: ship.id,
      experience: ship.experience,
    }
    // initLobbySocket().then(() => {
    //   showLobby = true
    // })
    showLobby = true
    localStorage.setItem('chosenShip', JSON.stringify({ id: ship.id, userId: ship.userId }))
    $socketStore.send($localPlayerStore)
    updateSessions()
  }
</script>

{#if $isLoggedInStore}
  {#if shipModalOpen}
    {#if $userStore.ships.length === 0}
      <AddShip openModal={!chosenShip} />
    {:else}
      <ModalSimple title="Playable ships" saveButton={false} cancelButton={!!chosenShip} closeBtn={() => (shipModalOpen = false)}>
        <Ships
          changeShipOnClick={false}
          clickedShipCallback={(ship) => {
            handleChosenShip(ship)
          }}
        />
      </ModalSimple>
    {/if}
  {/if}
{/if}
{#if showLobby && $localPlayerStore.ship}
  <Page>
    <div class="lobbyWrapper">
      <div class="left">
        {#if sessions.length > 0}
          <SessionList localPlayer={$localPlayerStore} joinSession={joinSession_} {sessions} />
        {:else}
          <h5 style="padding: 1em;">Servers are offline...play locally?</h5>
          {@const offlineSessionId = 'Messier87'}
          <Button90
            addInfo="Play"
            icon={Icons.StartGame}
            buttonConfig={{
              buttonText: 'Play',
              clickCallback: () => startGame(offlineSessionId),
              selected: false,
            }}
          />
        {/if}
      </div>
      {#if joinedSession}
        <div class="center">
          <div class="sessionInfo">
            <p style={$localPlayerStore.sessionId === joinedSession.id ? 'color: #c89' : 'color: var(--main-text-color)'}>
              Server: {joinedSession.id}
              <!-- {#if joinedSession.host.readyToPlay}
                <span style="filter: hue-rotate(72deg)">
                  <img draggable="false" class="readyFlag" src={Icons.Done} alt="Ready" />
                </span>
              {/if} -->
            </p>

            <div class="shipCards" style="display: flex; flex-wrap: wrap">
              <!-- <ShipCardInfo shipOwner={joinedSession.host.name} chosenShip={joinedSession.host.ship} /> -->
              <ShipCardInfo clickedShip={(ship) => (shipModalOpen = true)} shipOwner={$localPlayerStore.name} chosenShip={$localPlayerStore.ship} />
            </div>
          </div>
          <div class="buttonWrapper">
            <Button90
              addInfo="Play"
              icon={Icons.StartGame}
              buttonConfig={{
                buttonText: 'Play',
                clickCallback: () => startGame(),
                selected: false,
              }}
            />
          </div>
        </div>
        <div class="right">
          <Chat joinedSessionId={joinedSession?.id} />
        </div>
      {/if}
    </div>
  </Page>
{/if}

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
    grid-template-rows: 1fr auto;
  }

  .right {
    grid-template-rows: 1fr auto auto;
    width: 350px;
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

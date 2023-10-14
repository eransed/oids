<script lang="ts">
  //Stores
  import { guestUserName, user, localPlayer, pageHasHeader, isLoggedIn, guestUser, socket, chatMessageHistory, gameSessionId } from '../../stores/stores'

  //Interfaces
  import { MessageType, type SpaceObject } from '../../lib/interface'

  //Components
  import Page from '../../components/page/page.svelte'
  import Ships from '../ProfilePage/Ships.svelte'

  //Services
  import type { ChatMessage, ChosenShip, Session } from '../../lib/interface'
  import { createSessionId } from '../../utils/utils'
  import { activeSessions } from '../../lib/services/game/activeSessions'
  import SessionList from './components/SessionList/SessionList.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { log, warn } from 'mathil'
  import Chat from '../../components/chat/chat.svelte'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import Button90 from '../../components/menu/Button90.svelte'

  //Assets
  import { Icons } from '../../style/icons'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'
  import type { Ship } from '@prisma/client'
  import AddShip from '../ProfilePage/AddShip.svelte'
  import ShipCardInfo from '../../components/ships/ShipCardInfo.svelte'

  /**
   * Reactive on changes to $user store.
   */
  $: if ($user && $user.name !== $localPlayer.name) {
    $localPlayer.name = $user.name
    $socket.send($localPlayer)
    if ($user.ships.length === 1) {
      $localPlayer.ship = createChosenShip($user.ships[0])
      console.log($user.ships)
      $socket.send($localPlayer)
    } else {
      shipModalOpen = true
    }
    updateSessions()
  }

  $: if ($isLoggedIn === false) {
    console.log('User logged out - renaming to guest name')
    $localPlayer.name = $guestUser.name
    $socket.send($localPlayer)
    log('$: if ($isLoggedIn === false)')
    updateSessions()
  }

  $: allReady = false
  let readyPlayers = []

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

    if (joinedSession?.players) {
      readyPlayers = []
      joinedSession?.players.forEach((player) => {
        console.log(`${player.name}: ${player.readyToPlay ? 'ready' : 'not ready'}`)
        if (player.readyToPlay) {
          readyPlayers.push(player)
        }
      })
    }

    if (readyPlayers.length === joinedSession?.players.length) {
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
  let chosenShip: Ship
  let shipModalOpen: boolean = false

  async function initLobbySocket() {
    return new Promise<void>((resolve, reject) => {
      $localPlayer.name = $user ? $user.name : $guestUserName
      if (!$isLoggedIn) {
        $localPlayer.ship = {
          name: '',
          shipVariant: 0,
          level: 0,
          userId: '',
          id: '',
        }
      }

      $socket.connect().then(() => {
        console.log(`Connected to websocket`)
        hostSession()
      })

      console.log('Adding lobby websocket listener...')

      $socket
        .addListener(
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
    }
    return chosenShip
  }

  onMount(() => {
    const storedShipJson = localStorage.getItem('chosenShip')

    if (storedShipJson && $user) {
      console.log('storedShip', storedShipJson)
      const storedShip = JSON.parse(storedShipJson)
      if (storedShip) {
        $user.ships.find((ship) => {
          if (ship.id === storedShip.id) {
            $localPlayer.ship = createChosenShip(ship)
            return
          }
        })
      }
    }

    console.log('localplayer:', $localPlayer)

    if ($isLoggedIn && $user && !storedShipJson) {
      shipModalOpen = true
      if ($user.ships.length > 0) {
        $localPlayer.ship = createChosenShip($user.ships[0])
      }
    } else {
      console.log('else')
      initLobbySocket().then(() => {
        showLobby = true
        updateSessions()
      })
    }
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

  async function updateSessions() {
    await activeSessions()
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

  function handleChosenShip(ship: Ship) {
    console.log('clickedshipcallback')
    shipModalOpen = false
    chosenShip = ship
    $localPlayer.ship = {
      level: ship.level,
      name: ship.name,
      userId: ship.userId,
      shipVariant: ship.variant,
      id: ship.id,
    }
    initLobbySocket().then(() => {
      showLobby = true
    })
    localStorage.setItem('chosenShip', JSON.stringify({ id: ship.id, userId: ship.userId }))
    $socket.send($localPlayer)
    updateSessions()
  }
</script>

{#if $isLoggedIn}
  {#if shipModalOpen}
    {#if $user.ships.length === 0}
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
{#if showLobby && $localPlayer.ship}
  <Page>
    <div class="lobbyWrapper">
      <div class="left">
        <SessionList joinSession={joinSession_} localPlayer={$localPlayer} {sessions} />
      </div>
      <div class="center">
        {#if joinedSession}
          <div class="sessionInfo">
            <p style={$localPlayer.name === joinedSession.host.name ? 'color: #c89' : 'color: var(--main-text-color)'}>
              Host: {joinedSession.host.name}
              {#if joinedSession.host.readyToPlay}
                <span style="filter: hue-rotate(72deg)">
                  <img draggable="false" class="readyFlag" src={Icons.Done} alt="Ready" />
                </span>
              {/if}
            </p>

            <div class="shipCards" style="display: flex; flex-wrap: wrap">
              <!-- <ShipCardInfo shipOwner={joinedSession.host.name} chosenShip={joinedSession.host.ship} /> -->
              {#each joinedSession.players as player}
                <ShipCardInfo clickedShip={(ship) => (shipModalOpen = true)} shipOwner={player.name} chosenShip={player.ship} />
              {/each}
            </div>
          </div>
          <div class="buttonWrapper">
            <Button90 icon={Icons.Exit} buttonConfig={{ buttonText: 'Leave Session', clickCallback: () => leaveSession(), selected: false }} />
            <span style="filter: {$localPlayer.readyToPlay ? 'hue-rotate(72deg)' : ''}">
              <Button90
                icon={Icons.Done}
                buttonConfig={{ buttonText: 'Toggle ready!', clickCallback: () => toggleReadyToPlay(), selected: $localPlayer.readyToPlay }}
              />
            </span>

            <Button90
              addInfo={allReady ? 'Start game!' : `${readyPlayers.length} / ${joinedSession?.players.length}`}
              icon={Icons.StartGame}
              disabled={!allReady}
              buttonConfig={{
                buttonText: allReady ? 'Start game!' : `${readyPlayers.length} / ${joinedSession?.players.length} ready!`,
                clickCallback: () => startGame(),
                selected: false,
              }}
            />
          </div>
        {:else}
          <CircularSpinner ship />
        {/if}
      </div>
      <div class="right">
        {#if joinedSession}
          <Chat joinedSessionId={joinedSession?.id} />
        {/if}
      </div>
    </div>
  </Page>
{/if}

<style>
  .readyFlag {
    margin-left: 0em;
    width: 15px;
    height: 15px;
    filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg) brightness(83%) contrast(125%);
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

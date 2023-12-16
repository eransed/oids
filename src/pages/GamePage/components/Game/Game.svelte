<script lang="ts">
  //Interfaces
  import { navigate } from 'svelte-routing'
  import type { ChosenShip, Session, SpaceObject } from '../../../../lib/interface'

  //Svelte
  import { onDestroy, onMount } from 'svelte'
  import { Game } from '../../../../lib/game'
  import { getKeyMap, initKeyControllers, initTouchControls, removeKeyControllers, removeTouchControls } from '../../../../lib/input'

  //Components
  import GameMenu from '../Menu/GameMenu.svelte'
  import InGameInfo from '../InGameInfo/inGameInfo.svelte'
  import HotKeys from '../Hotkeys/hotKeys.svelte'
  import ShipSettings from '../ShipSettings/ShipSettings.svelte'

  //Websocket
  // import { disconnect } from "../../../../lib/websocket/webSocket"
  import ScoreScreen from '../LeaderBoardScreen/ScoreScreen.svelte'

  // Game variants
  import { initRegularGame, nextFrame, renderFrame, resetStars } from '../../../../lib/gameModes/regular'
  import { guestUserNameStore, isLoggedInStore, localPlayerStore, socketStore, userStore, shouldCelebrateLevelUp } from '../../../../stores/stores'
  import { gameRef } from './Utils/mainGame'
  import { playersInSession } from '../../../../lib/services/game/playersInSession'
  import { info } from 'mathil'
  import ModalSimple from '../../../../components/modal/ModalSimple.svelte'
  import Ships from '../../../ProfilePage/Ships.svelte'
  import type { Ship } from '@prisma/client'
  import AddShip from '../../../ProfilePage/AddShip.svelte'
  import ShipDetails from '../ShipSettings/ShipDetails.svelte'
  import Chat from '../../../../components/chat/chat.svelte'
  import ProgressBar from '../../../../components/progress/progressBar.svelte'
  import { screenScale } from '../../../../lib/constants'
  import { getShipXpRequirement } from '../../../../lib/services/utils/shipLevels'
  import Celebration from '../../../../components/celebration/celebration.svelte'
  import ProfileModal from '../../../../components/profile/ProfileModal.svelte'
  import ShipCardInfo from '../../../../components/ships/ShipCardInfo.svelte'
  import { getShipBundleCache } from '../../../../style/ships'

  const showScoreScreen = getKeyMap().leaderBoard.store
  const showHotKeys = getKeyMap().hotKeys.store
  const shipSettings = getKeyMap().shipSettings.store
  const showShipDetails = getKeyMap().shipDetails.store
  const showChat = getKeyMap().chat.store
  const showMenu = getKeyMap().menu.store

  let game: Game

  //Props
  export let sessionId: string

  console.log(sessionId)

  let canvas: HTMLCanvasElement
  // let cleanup: () => void

  const noContext = document.getElementById('noContextMenu')

  noContext?.addEventListener('contextmenu', (e) => {
    console.log('what')
    e.preventDefault()
  })

  async function players(): Promise<Session> {
    const players: Session = await playersInSession(sessionId).then((d) => d.data)

    return players
  }

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

  let chosenShip: ChosenShip
  let shipModalOpen = false

  onMount(async () => {
    // cleanup = initSettingsControl()
    if (!$isLoggedInStore) {
      $localPlayerStore.name = $guestUserNameStore
    }

    if ($isLoggedInStore && $userStore.ships.length === 1) {
      $localPlayerStore.ship = createChosenShip($userStore.ships[0])
      chosenShip = $localPlayerStore.ship
    } else {
      const storedShipJson = localStorage.getItem('chosenShip')

      if (storedShipJson && $isLoggedInStore) {
        const localStorageShip = JSON.parse(storedShipJson)
        const shipFromStorage = $userStore.ships.find((ship) => {
          if (ship.id === localStorageShip.id) return ship
        })

        if (shipFromStorage) {
          $localPlayerStore.ship = createChosenShip(shipFromStorage)
          console.log('found ship in localstorage:', shipFromStorage)
          chosenShip = $localPlayerStore.ship
        }
      }
    }

    game = new Game(canvas, $localPlayerStore, $socketStore, getKeyMap(), showDeadMenu)
    gameRef(game)
    game.localPlayer.sessionId = sessionId
    players().then((d) => {
      const players = d.players
      console.log(players)
      if (players.length === 0) {
        info(`You are the host!`)
        game.localPlayer.isHost = true
      }
    })
    if (!$isLoggedInStore || chosenShip) {
      game.startGame(initRegularGame, renderFrame, nextFrame)
      resetStars(game)
    }

    window.addEventListener('resize', handleResize)
  })

  function handleResize() {
    resetStars(game)
  }

  const showDeadMenu = (): void => {
    removeKeyControllers()
    removeTouchControls()
    game.stopGame()
    game.websocket.resetListeners()
    navigate('/play')
  }

  onDestroy(() => {
    removeKeyControllers()
    removeTouchControls()
    game.stopGame()
    window.removeEventListener('resize', handleResize)
  })
</script>

<div class="shipWrapper" style="z-index: 1;">
  <div class="shipAvatar">
    <img style="width: 80%;" draggable="false" src={getShipBundleCache($localPlayerStore.ship.shipVariant).svgUrl} alt={$localPlayerStore.ship.name} />
    <div class="shipLevel">{$localPlayerStore.ship.level}</div>
  </div>
  <div class="shipInfo">
    <div class="shipName">
      {$localPlayerStore.ship.name}
    </div>
    <div class="shipHealth">
      <ProgressBar progressColor="#50aa50" progress={$localPlayerStore.health} max={$localPlayerStore.startHealth} />
    </div>
    <div class="shipEnergy">
      <ProgressBar progressColor="#4040ff" progress={$localPlayerStore.batteryLevel} max={$localPlayerStore.batteryCapacity} />
    </div>
  </div>
</div>

<div class="gameInfo">
  <InGameInfo title={'Leaderboard'} showModal={$showScoreScreen}>
    <div class="scoreScreen">
      <ScoreScreen />
    </div>
  </InGameInfo>

  <InGameInfo title={'Key Map'} showModal={$showHotKeys}>
    <div class="hotKeys">
      <HotKeys activeColor={$localPlayerStore.color} />
    </div>
  </InGameInfo>

  <InGameInfo title={'Ship Settings'} showModal={$shipSettings}>
    <div class="hotKeys">
      <ShipSettings />
    </div>
  </InGameInfo>
</div>

<div class="bottomInterface">
  {#if $showChat}
    <div class="chat">
      <Chat chatTitle={false} joinedSessionId={sessionId} inGameChat />
    </div>
    <div class="xp">
      <ProgressBar progress={$localPlayerStore.ship.experience} max={getShipXpRequirement($localPlayerStore.ship.level)} />
    </div>
  {/if}
</div>

{#if $showShipDetails}
  <ModalSimple closeBtn={() => ($showShipDetails = !$showShipDetails)} saveButton={false}>
    <ShipDetails ship={$localPlayerStore.ship} />
  </ModalSimple>
{/if}

{#if $showMenu}
  <GameMenu currentGame={game} />
{/if}

{#if $shouldCelebrateLevelUp}
  <Celebration celebrationText={`You've reached level ${$localPlayerStore.ship.level}`} celebrationTimeoutCallback={() => ($shouldCelebrateLevelUp = false)} />
{/if}

{#if $isLoggedInStore && $userStore.ships.length > 1 && !chosenShip}
  {#if $userStore.ships.length === 0}
    <AddShip openModal={!chosenShip} />
  {:else}
    <ModalSimple title="Playable ships" saveButton={false} cancelButton={!!chosenShip} closeBtn={() => (shipModalOpen = false)}>
      <Ships
        changeShipOnClick={false}
        clickedShipCallback={(ship) => {
          console.log('clickedshipcallback')
          shipModalOpen = false
          chosenShip = createChosenShip(ship)
          $localPlayerStore.ship = {
            level: ship.level,
            name: ship.name,
            userId: ship.userId,
            shipVariant: ship.variant,
            id: ship.id,
            experience: ship.experience,
          }
          $localPlayerStore.name = $userStore.name
          game.startGame(initRegularGame, renderFrame, nextFrame)
          resetStars(game)
          localStorage.setItem('chosenShip', JSON.stringify({ id: ship.id, userId: ship.userId }))
        }}
      />
    </ModalSimple>
  {/if}
{/if}

<!-- <canvas oncontextmenu="return false;" class="game_canvas" id="noContextMenu" bind:this={canvas} /> -->
<canvas class="game_canvas" id="noContextMenu" bind:this={canvas} />

<style>
  :root {
    --height: '';
  }

  .shipWrapper {
    position: absolute;
    top: 1%;
    left: 1%;
    display: flex;
  }

  .shipAvatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--main-card-color);
    border: 2px solid color-mix(in srgb, var(--main-accent-color) 20%, var(--main-text-color) 10%);

    z-index: 1;
    /* margin-right: -0.4em; */
    align-content: center;
    justify-content: center;
    display: flex;
  }

  .shipInfo {
    width: 150px;
    height: 50px;
    border-radius: 0.5em;
    background-color: var(--main-card-color);
    border: 2px solid color-mix(in srgb, var(--main-accent-color) 20%, var(--main-text-color) 10%);

    display: flex;
    flex-direction: column;
    z-index: 1;
    gap: 0.3em;
  }

  .shipLevel {
    position: absolute;
    background-color: var(--main-card-color);
    border: 2px solid color-mix(in srgb, var(--main-accent-color) 20%, var(--main-text-color) 10%);
    border-radius: 50%;
    text-align: center;
    justify-content: center;
    align-content: center;
    display: flex;
    flex-wrap: wrap;
    height: 25px;
    width: 25px;
    bottom: -15%;
    left: -2%;
  }

  .shipName {
    height: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .shipHealth,
  .shipEnergy {
    position: relative;
    width: 96%;
    height: 0.5em;
    background-color: var(--main-card-color);
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    /* bottom: 30%; */
    margin-left: 2%;
    border-radius: 0.5em;
  }

  .xp {
    position: relative;
    width: 25%;
    height: 0.5em;
    background-color: var(--main-card-color);
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    /* bottom: 30%; */
    margin-left: 1%;
    border-radius: 0.5em;
    margin-bottom: 0.5em;
  }

  .game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    background-color: var(--main-bg-color);

    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE/Edge */
    user-select: none;
  }
  .gameInfo {
    display: flex;
    flex-flow: column;
    align-items: end;
    grid-template-rows: 50% auto;
    transition: all;
    transition-duration: 0.6s;
    transition-timing-function: ease-in;
    position: absolute;
    right: 0;
    top: 0em;
  }

  .gameInfo:has(.scoreScreen):has(.hotKeys) {
    grid-template-rows: 50% auto;
  }

  .bottomInterface {
    z-index: 1;
    display: flex;
    position: absolute;
    bottom: 0;
    width: 100%;
    /* background-color: red; */
    flex-wrap: wrap;
    /* align-content: center; */
    justify-content: flex-start;
    align-items: flex-end;
  }
</style>

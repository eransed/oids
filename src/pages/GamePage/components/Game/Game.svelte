<script lang="ts">
  //Interfaces
  import { navigate } from 'svelte-routing'
  import type { ChosenShip, Session, SpaceObject } from '../../../../lib/interface'

  //Svelte
  import { onDestroy, onMount } from 'svelte'
  import { createSpaceObject, currentTimeDate } from '../../../../lib/factory'
  import { Game } from '../../../../lib/game'
  import { getKeyMap, removeKeyControllers, removeTouchControls } from '../../../../lib/input'

  //Components
  import GameMenu from '../Menu/GameMenu.svelte'
  import InGameInfo from '../InGameInfo/inGameInfo.svelte'
  import HotKeys from '../Hotkeys/hotKeys.svelte'
  import ShipSettings from '../ShipSettings/ShipSettings.svelte'
  import { ShipBundles } from '../../../../style/ships'

  //Websocket
  // import { disconnect } from "../../../../lib/websocket/webSocket"
  import ScoreScreen from '../LeaderBoardScreen/ScoreScreen.svelte'

  // Game variants
  import { initRegularGame, nextFrame, renderFrame } from '../../../../lib/gameModes/regular'
  import { guestUserName, isLoggedIn, localPlayer, socket, user } from '../../../../stores/stores'
  import { saveGame } from '../../../../lib/services/game/saveGame'
  import type { GameHistory } from '../../../../interfaces/game'
  import { gameRef } from './Utils/mainGame'
  import { playersInSession } from '../../../../lib/services/game/playersInSession'
  import type { AxiosResponse } from 'axios'
  import { info } from 'mathil'
  import getProfile from '../../../../lib/services/user/profile'
  import ModalSimple from '../../../../components/modal/ModalSimple.svelte'
  import Ships from '../../../ProfilePage/Ships.svelte'
  import type { Ship } from '@prisma/client'
  import AddShip from '../../../ProfilePage/AddShip.svelte'

  const showScoreScreen = getKeyMap().leaderBoard.store
  const showHotKeys = getKeyMap().hotKeys.store
  const shipSettings = getKeyMap().shipSettings.store

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
    }
    return chosenShip
  }

  let chosenShip: ChosenShip
  let shipModalOpen = false

  onMount(async () => {
    // cleanup = initSettingsControl()
    if (!$isLoggedIn) {
      $localPlayer.name = $guestUserName
    }

    if ($isLoggedIn && $user.ships.length === 1) {
      $localPlayer.ship = createChosenShip($user.ships[0])
      chosenShip = $localPlayer.ship
    } else {
      const storedShipJson = localStorage.getItem('chosenShip')

      if (storedShipJson && $isLoggedIn) {
        const localStorageShip = JSON.parse(storedShipJson)
        const shipFromStorage = $user.ships.find((ship) => {
          if (ship.id === localStorageShip.id) return ship
        })

        if (shipFromStorage) {
          $localPlayer.ship = createChosenShip(shipFromStorage)
          console.log('found ship in localstorage:', shipFromStorage)
          chosenShip = $localPlayer.ship
        }
      }
    }

    game = new Game(canvas, $localPlayer, $socket, getKeyMap(), showDeadMenu)
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
    if (!$isLoggedIn || chosenShip) {
      game.startGame(initRegularGame, renderFrame, nextFrame)
    }
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    removeTouchControls()
    game.stopGame()
    game.websocket.resetListeners()
    navigate('/play')
  }

  onDestroy(() => {
    game.stopGame()
  })
</script>

<div class="gameInfo">
  <InGameInfo title={'Leaderboard'} showModal={$showScoreScreen}>
    <div class="scoreScreen">
      <ScoreScreen />
    </div>
  </InGameInfo>

  <InGameInfo title={'Key Map'} showModal={$showHotKeys}>
    <div class="hotKeys">
      <HotKeys activeColor={$localPlayer.color} />
    </div>
  </InGameInfo>

  <InGameInfo title={'Ship Settings'} showModal={$shipSettings}>
    <div class="hotKeys">
      <ShipSettings />
    </div>
  </InGameInfo>
</div>

<GameMenu currentGame={game} />

{#if $isLoggedIn && $user.ships.length > 1 && !chosenShip}
  {#if $user.ships.length === 0}
    <AddShip openModal={!chosenShip} />
  {:else}
    <ModalSimple title="Playable ships" saveButton={false} cancelButton={!!chosenShip} closeBtn={() => (shipModalOpen = false)}>
      <Ships
        changeShipOnClick={false}
        clickedShipCallback={(ship) => {
          console.log('clickedshipcallback')
          shipModalOpen = false
          chosenShip = createChosenShip(ship)
          $localPlayer.ship = {
            level: ship.level,
            name: ship.name,
            userId: ship.userId,
            shipVariant: ship.variant,
            id: ship.id,
          }
          $localPlayer.name = $user.name
          game.startGame(initRegularGame, renderFrame, nextFrame)
          localStorage.setItem('chosenShip', JSON.stringify({ id: ship.id, userId: ship.userId }))
        }}
      />
    </ModalSimple>
  {/if}
{/if}
<canvas oncontextmenu="return false;" class="game_canvas" id="noContextMenu" bind:this={canvas} />

<style>
  :root {
    --height: '';
  }

  .game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    background-color: var(--main-bg-color);
    /* cursor: none; */
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
</style>

<script lang="ts">
  //Interfaces
  import { navigate } from 'svelte-routing'
  import { GameMode, type Session, type Ship } from '../../../../lib/interface'

  //Svelte
  import { onDestroy, onMount } from 'svelte'
  import { Game } from '../../../../lib/game'
  import { ActiveKeyMapStore, arcadeKeyMapManagerStore, removeKeyControllers, removeTouchControls, spaceKeyMapManagerStore } from '../../../../lib/input'

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
  import { localPlayerStore, socketStore, userStore, shouldCelebrateLevelUp } from '../../../../stores/stores'
  import { gameRef } from './Utils/mainGame'
  import { getPlayersInSession } from '../../../../lib/services/game/playersInSession'
  import ModalSimple from '../../../../components/modal/ModalSimple.svelte'
  import ShipDetails from '../ShipSettings/ShipDetails.svelte'
  import Chat from '../../../../components/chat/chat.svelte'
  import ProgressBar from '../../../../components/progress/progressBar.svelte'
  import { getShipXpRequirement } from '../../../../lib/services/utils/shipLevels'
  import Celebration from '../../../../components/celebration/celebration.svelte'
  import { getShipBundleCache } from '../../../../style/ships'
  import Page from '../../../../components/page/page.svelte'
  import CircularSpinner from '../../../../components/loaders/circularSpinner.svelte'
  import { fly } from 'svelte/transition'
  import { logInfo } from '../../../../components/alert/alertHandler'

  let game: Game

  //Props
  export let sessionId: string

  let canvas: HTMLCanvasElement

  // let cleanup: () => void

  const noContext = document.getElementById('noContextMenu')

  noContext?.addEventListener('contextmenu', (e) => {
    console.log('what')
    e.preventDefault()
  })

  let chosenShip: Ship = $localPlayerStore.ship
  let shipModalOpen = false
  let loadingGame = true
  $: loadingText = ''

  onMount(async () => {
    loadingText = 'Starting OIDS'
    loadingGame = true
    // cleanup = initSettingsControl()

    if ($userStore) {
      if ($userStore.ships.length === 1) {
        $localPlayerStore.ship = $userStore.ships[0]
        chosenShip = $localPlayerStore.ship
      }
    }

    $socketStore.send($localPlayerStore)

    game = new Game(canvas, $localPlayerStore, $socketStore, showDeadMenu)
    gameRef(game)
    game.localPlayer.sessionId = sessionId

    try {
      loadingText = 'Anybody out there'
      const playerList = await getPlayersInSession(sessionId)

      if (playerList) {
        console.log(playerList)
        playerList.players.forEach((player) => {
          if (player.name !== $localPlayerStore.name) {
            game.remotePlayers.push(player)
          }
        })
        if (!$userStore || chosenShip) {
          game.startGame(initRegularGame, renderFrame, nextFrame)
          resetStars(game)
        }
      }
      loadingGame = false
    } catch (err: any) {
      loadingGame = false
      game.startGame(initRegularGame, renderFrame, nextFrame)
      resetStars(game)
      console.error(err)
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

{#if loadingGame}
  <div in:fly={{ duration: 400 }} style="z-index: 1000;">
    <CircularSpinner ship text={loadingText} />
  </div>
{/if}

{#if $ActiveKeyMapStore.healthBar.keyStatus}
  <div class="shipWrapper" style="z-index: 1;">
    <div class="shipAvatar">
      <img style="width: 80%;" draggable="false" src={getShipBundleCache($localPlayerStore.ship.variant).svgUrl} alt={$localPlayerStore.ship.name} />
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
{/if}

{#if game}
  <div class="gameInfo">
    <InGameInfo title={'Leaderboard'} showModal={$ActiveKeyMapStore.leaderBoard.store}>
      <div class="scoreScreen">
        <ScoreScreen />
      </div>
    </InGameInfo>

    <InGameInfo title={`Key Map - ${$ActiveKeyMapStore.name}`} showModal={$ActiveKeyMapStore.hotKeys.store}>
      <div class="hotKeys">
        <!-- {#if keyMapManager.getKeyMap().name !== 'Space' && keyMapManager.getKeyMap().name !== 'Arcade'}
          <Button90
            buttonType="button"
            icon={Icons.Reset}
            addInfo={`Reset default to: ${keyMapManager.getDefault().name}`}
            buttonConfig={{ buttonText: `Reset to default: ${keyMapManager.getDefault().name}`, clickCallback: () => resetKeyMapToDefault(keyMapManager), selected: false }}
          />
        {/if} -->
        <HotKeys
          Mode={game.localPlayer.gameMode}
          activeColor={$localPlayerStore.color}
          keyMapManager={$localPlayerStore.gameMode === GameMode.SPACE_MODE ? $spaceKeyMapManagerStore : $arcadeKeyMapManagerStore}
        />
      </div>
    </InGameInfo>

    <InGameInfo title={'Ship Settings'} showModal={$ActiveKeyMapStore.shipSettings.store}>
      <div class="hotKeys">
        <ShipSettings />
      </div>
    </InGameInfo>
  </div>
{/if}

<div class="bottomInterface">
  {#if $ActiveKeyMapStore.chat.store}
    <div class="chat">
      <Chat chatTitle={false} joinedSessionId={sessionId} inGameChat />
    </div>
    <div class="xp">
      <ProgressBar progress={$localPlayerStore.ship.experience} max={getShipXpRequirement($localPlayerStore.ship.level)} />
    </div>
  {/if}
</div>

{#if $ActiveKeyMapStore.shipDetails.store}
  <ModalSimple closeBtn={() => ($ActiveKeyMapStore.shipDetails.store = !$ActiveKeyMapStore.shipDetails.store)} saveButton={false}>
    <ShipDetails ship={$localPlayerStore.ship} />
  </ModalSimple>
{/if}

{#if $ActiveKeyMapStore.menu.store}
  <GameMenu currentGame={game} />
{/if}

{#if $shouldCelebrateLevelUp}
  <Celebration celebrationText={`You've reached level ${$localPlayerStore.ship.level}`} celebrationTimeoutCallback={() => ($shouldCelebrateLevelUp = false)} />
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

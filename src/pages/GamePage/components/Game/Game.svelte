<script lang="ts">
  //Interfaces
  import { navigate } from "svelte-routing"
  import type { SpaceObject } from "../../../../lib/interface"

  //Svelte
  import { onDestroy, onMount } from "svelte"

  import { createSpaceObject, currentTimeDate } from "../../../../lib/factory"
  import { Game } from "../../../../lib/game"
  import { getKeyMap, removeKeyControllers } from "../../../../lib/input"

  //Components
  import GameMenu from "../Menu/GameMenu.svelte"
  import InGameInfo from "../InGameInfo/inGameInfo.svelte"
  import HotKeys from "../Hotkeys/hotKeys.svelte"
  import ShipSettings from "../ShipSettings/ShipSettings.svelte"

  //Websocket
  import { disconnect, initMultiplayer } from "../../../../lib/websocket/webSocket"
  import ScoreScreen from "../LeaderBoardScreen/ScoreScreen.svelte"

  // Game variants
  import { initRegularGame, nextFrame, renderFrame } from "../../../../lib/gameModes/regular"
  import { guestUserName, user } from "../../../../stores/stores"

  const showScoreScreen = getKeyMap().leaderBoard.store
  const showHotKeys = getKeyMap().hotKeys.store
  const shipSettings = getKeyMap().shipSettings.store

  let game: Game

  //Props
  export let sessionId: string

  let canvas: HTMLCanvasElement
  // let cleanup: () => void
  const localPlayer = createSpaceObject($user ? $user.name : $guestUserName)

  onMount(() => {
    // cleanup = initSettingsControl()
    game = new Game(canvas, localPlayer, getKeyMap(), showDeadMenu)
    game.localPlayer.sessionId = sessionId
    game.localPlayer.joinedGame = currentTimeDate()
    // game.startMultiplayer()
    game.startGame(initRegularGame, renderFrame, nextFrame)
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    game.stopGame()
    navigate("/play")
  }

  onDestroy(() => {
    disconnect()
  })
</script>

<style>
  :root {
    --height: "";
  }

  .game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    /* cursor: none; */
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

<div class="gameInfo">
  <InGameInfo title={"Leaderboard"} showModal={$showScoreScreen}>
    <div class="scoreScreen">
      <ScoreScreen />
    </div>
  </InGameInfo>

  <InGameInfo title={"Key Map"} showModal={$showHotKeys}>
    <div class="hotKeys">
      <HotKeys activeColor={localPlayer.color} />
    </div>
  </InGameInfo>

  <InGameInfo title={"Ship Settings"} showModal={$shipSettings}>
    <div class="hotKeys">
      <ShipSettings />
    </div>
  </InGameInfo>
</div>

<GameMenu currentGame={game} />
<canvas class="game_canvas" bind:this={canvas} />

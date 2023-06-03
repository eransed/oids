<script lang="ts">
  //Interfaces
  import { navigate } from "svelte-routing"

  //Svelte
  import { onDestroy, onMount } from "svelte"

  import { createSpaceObject, currentTimeDate } from "../../../../lib/factory"
  import { Game } from "../../../../lib/game"
  import { getKeyMap, removeKeyControllers } from "../../../../lib/input"

  //Components
  import GameMenu from "../Menu/GameMenu.svelte"
  import InGameInfo from "../inGameInfo/inGameInfo.svelte"
  import HotKeys from "../Hotkeys/hotKeys.svelte"

  //Websocket
  import { disconnect } from "../../../../lib/websocket/webSocket"
  import ScoreScreen from "../leaderBoardScreen/ScoreScreen.svelte"

  //Stores
  import { showHotKeys, showScoreScreen } from "./store/gameStores"

  let game: Game

  //Props
  export let sessionId: string | undefined

  let canvas: HTMLCanvasElement
  let cleanup: () => void
  const localPlayer = createSpaceObject("LocalPlayer")

  onMount(() => {
    // cleanup = initSettingsControl()
    game = new Game(canvas, localPlayer, getKeyMap(), showDeadMenu)
    game.localPlayer.sessionId = sessionId
    game.localPlayer.joinedGame = currentTimeDate()
    game.startMultiplayer()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    game.stopGame()
    navigate("/play/game/end")
  }

  onDestroy(() => {
    disconnect()
    // if (cleanup) {
    //   getKeyMap().leaderBoard.store?.set(false)
    //   cleanup()
    // }
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
  <InGameInfo title={"Leaderboard"} showModal={$showScoreScreen} closedCallback={() => {}}>
    <div class="scoreScreen">
      <ScoreScreen />
    </div>
  </InGameInfo>

  <InGameInfo title={"Key Map"} showModal={$showHotKeys} closedCallback={() => {}}>
    <div class="hotKeys">
      <HotKeys activeColor={localPlayer.color} />
    </div>
  </InGameInfo>
</div>

<GameMenu currentGame={game} />
<canvas class="game_canvas" bind:this={canvas} />

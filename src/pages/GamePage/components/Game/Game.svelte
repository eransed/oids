<script lang="ts">
  //Interfaces
  import { navigate } from "svelte-routing"

  //Svelte
  import { onDestroy, onMount } from "svelte"

  import { createSpaceObject } from "../../../../lib/factory"
  import { Game } from "../../../../lib/game"
  import { removeKeyControllers } from "../../../../lib/input"

  //Components
  import GameMenu from "../Menu/GameMenu.svelte"
  import { initSettingsControl, gameSettings } from "./GameSettings"

  //Websocket
  import { disconnect } from "../../../../lib/websocket/webSocket"
  import ScoreScreen from "../scoreScreen/ScoreScreen.svelte"
  import type { ScoreScreenData } from "../scoreScreen/ScoreScreen.types"

  //Stores
  import { showHotKeys, showScoreScreen } from "./store/gameStores"
  import InGameInfo from "../../../../components/inGameInfo/inGameInfo.svelte"
  import HotKeys from "../Hotkeys/hotKeys.svelte"

  let currentGame: Game

  //Props
  export let sessionId: string | undefined

  let canvas: HTMLCanvasElement
  let cleanup: () => void

  onMount(() => {
    cleanup = initSettingsControl()
    const localPlayer = createSpaceObject("LocalPlayer")
    currentGame = new Game(canvas, localPlayer, gameSettings, showDeadMenu)
    currentGame.localPlayer.sessionId = sessionId
    currentGame.startMultiplayer()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    currentGame.stopGame()
    navigate("/play/game/end")
  }

  onDestroy(() => {
    disconnect()
    if (cleanup) {
      gameSettings.scoreScreen.store?.set(false)
      cleanup()
    }
  })

  let ScoreScreenData: ScoreScreenData

  ScoreScreenData = {
    players: [
      { name: "erik", alive: false },
      { name: "Alex", alive: true },
    ],
  }
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
  <InGameInfo title={"Score screen"} showModal={$showScoreScreen} closedCallback={() => {}}>
    <div class="scoreScreen">
      <ScoreScreen {ScoreScreenData} />
    </div>
  </InGameInfo>

  <InGameInfo title={"Hotkeys"} showModal={$showHotKeys} closedCallback={() => {}}>
    <div class="hotKeys">
      <HotKeys />
    </div>
  </InGameInfo>
</div>

<GameMenu {currentGame} />
<canvas class="game_canvas" bind:this={canvas} />

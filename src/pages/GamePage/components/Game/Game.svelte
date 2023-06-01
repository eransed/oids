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
  import ScoreScreen from "../../../../components/scoreScreen/ScoreScreen.svelte"
  import type { ScoreScreenData } from "../../../../components/scoreScreen/ScoreScreen.types"

  //Stores
  import { showModal } from "./store/gameStores"

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
      gameSettings.showScoreScreen.store?.set(false)
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
  .game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    /* cursor: none; */
  }
</style>

<ScoreScreen showModal={$showModal} {ScoreScreenData} closedCallback={() => console.log("closed")} />
<GameMenu {currentGame} />
<canvas class="game_canvas" bind:this={canvas} />

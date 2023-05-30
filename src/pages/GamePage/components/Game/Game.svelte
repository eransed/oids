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

  let game: Game

  //Props
  export let sessionId: string | undefined

  let canvas: HTMLCanvasElement

  onMount(() => {
    const localPlayer = createSpaceObject("LocalPlayer")
    game = new Game(canvas, localPlayer, showDeadMenu)
    game.localPlayer.sessionId = sessionId
    game.startMultiplayer()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    game.stopGame()
    navigate("/play/game/end")
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

<GameMenu currentGame={game} />
<canvas class="game_canvas" bind:this={canvas} />

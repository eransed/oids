<script lang="ts">
  //Interfaces
  import { navigate } from "svelte-routing"

  //Svelte
  import { onDestroy, onMount } from "svelte"

  import { createSpaceObject } from "../../../../lib/factory"
  import { Game } from "../../../../lib/game"
  import { removeKeyControllers } from "../../../../lib/input"
  import GameMenu from "../Menu/GameMenu.svelte"

  let game: Game

  export let sessionId: string | undefined

  export function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  onMount(() => {
    const localPlayer = createSpaceObject("LocalPlayer")
    game = new Game(getCanvas(), localPlayer, showDeadMenu)
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
  #game_canvas {
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
<canvas id="game_canvas" />

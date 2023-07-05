<script lang="ts">
  //Svelte
  import { onMount, onDestroy } from "svelte"
  import { fade } from "svelte/transition"

  //Components
  import Page from "../../../../components/page/page.svelte"
  import Card from "../../../../components/card/card.svelte"
  import TypeWriter from "../../../../components/typeWriter/TypeWriter.svelte"

  //Game
  import { Game } from "../../../../lib/game"

  //Utils
  import { createSpaceObject } from "../../../../lib/factory"
  import { getKeyMap, removeKeyControllers } from "../../../../lib/input"
  import { navigate } from "svelte-routing"

  let gameMode: Game
  let canvas: HTMLCanvasElement

  const localPlayer = createSpaceObject("LocalPlayer")

  onMount(() => {
    // cleanup = initSettingsControl()
    gameMode = new Game(canvas, localPlayer, getKeyMap(), showDeadMenu)

    gameMode.startWelcomeScreen()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    gameMode.stopGame()
  }

  onDestroy(() => {
    gameMode.stopGame()
  })

  const chosenMultiplayer = () => {
    removeKeyControllers()
    gameMode.stopGame()

    navigate("/play/multiplayer")
  }
</script>

<div in:fade={{ delay: 50 }}>
  <Page>
    <Card clickedOnCard={() => chosenMultiplayer()}>
      <div class="cardTitle">
        <TypeWriter speed={50} text="Multiplayer" />
      </div>
      <canvas bind:this={canvas} />
    </Card>
  </Page>
</div>

<!-- ToDo: Add list of open sessions and back button if chosen wrong gameMode -->

<style>
  canvas {
    opacity: 0.5;
    width: 300px;
    height: 300px;
    position: relative;
    transform: all 0.5s;
  }

  canvas:hover {
    opacity: 1;
  }

  .cardTitle {
    position: absolute;
    justify-self: center;
    align-self: center;
  }
</style>

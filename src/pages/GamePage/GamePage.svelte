<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"

  //Components
  import Game from "../GamePage/components/Game/Game.svelte"

  //Stores
  import { currentLocation, gameSessionId } from "../../stores/stores"

  //Location update
  currentLocation.set("/play/game")
</script>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    height: 100vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
  }
</style>

<div class="wrapper" in:fade={{ delay: 300 }} out:fade>
  <Game sessionId={$gameSessionId} />
</div>

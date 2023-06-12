<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"
  import type { RouteParams } from "svelte-routing/types/Route"

  //Components
  import Game from "../GamePage/components/Game/Game.svelte"

  //Stores
  import { gameSessionId, pageHasHeader } from "../../stores/stores"

  pageHasHeader.set(false)

  export let gameIdParam: string

  let sessionId: string = $gameSessionId ? $gameSessionId : gameIdParam
</script>

<style>
  .gamePage {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    height: 100vh;
    width: 100vw;
  }
</style>

<div class="gamePage" in:fade={{ delay: 300 }} out:fade>
  <Game {sessionId} />
</div>

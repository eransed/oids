<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Components
  import Game from '../GamePage/components/Game/Game.svelte'

  //Stores
  import { gameSessionIdStore, pageHasHeaderStore, localPlayerStore, socketStore } from '../../stores/stores'

  pageHasHeaderStore.set(false)

  export let gameIdParam: string

  let sessionId: string = $gameSessionIdStore ? $gameSessionIdStore : gameIdParam
</script>

<div class="gamePage" in:fade={{ delay: 300 }} out:fade>
  <Game {sessionId} />
</div>

<style>
  .gamePage {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: var(--main-text-color);
    height: 100vh;
    width: 100vw;
  }
</style>

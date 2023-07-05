<script lang="ts">
 //Svelte
 import { fade } from 'svelte/transition'

 //Components
 import Game from '../GamePage/components/Game/Game.svelte'

 //Stores
 import { gameSessionId, pageHasHeader, localPlayer } from '../../stores/stores'

 pageHasHeader.set(false)

 export let gameIdParam: string

 let sessionId: string = $gameSessionId ? $gameSessionId : gameIdParam
</script>

<div class="gamePage" in:fade={{ delay: 300 }} out:fade>
 <Game {sessionId} player={$localPlayer} />
</div>

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

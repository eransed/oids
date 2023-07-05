<script lang="ts">
  //Stores
  import { pageHasHeader } from '../../stores/stores'

  //Components
  import GameModes from './components/GameLobby/GameModes.svelte'

  pageHasHeader.set(true)
</script>

<div class="playPage">
  <GameModes />
</div>

<style>
  .playPage {
    color: #fff;
    height: 100vh;
    width: 100vw;
  }
</style>

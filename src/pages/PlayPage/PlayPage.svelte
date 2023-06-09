<script lang="ts">
  //Stores
  import { pageHasHeader } from "../../stores/stores"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"
  import GameLobby from "./components/GameLobby/GameLobby.svelte"
  import GameModes from "./components/GameLobby/GameModes.svelte"

  pageHasHeader.set(true)
</script>

<style>
  .playPage {
    color: #fff;
    height: 100vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
  }
</style>

<div class="playPage">
  <GameModes />
</div>

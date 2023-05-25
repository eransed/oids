<script lang="ts">
  //Stores
  import { currentLocation } from "../../stores/stores"

  //Components
  import GameLobby from "./components/GameLobby/GameLobby.svelte"

  //Location update
  currentLocation.set("/play")
</script>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    height: 50vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
  }
</style>

<div class="wrapper"><GameLobby /></div>

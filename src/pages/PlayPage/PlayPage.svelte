<script lang="ts">
  import { fade, slide, fly, blur } from "svelte/transition"
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  //Stores
  import { currentLocation } from "../../stores/stores"

  //Components
  import GameLobby from "./components/GameLobby/GameLobby.svelte"
  import SunRise from "../../components/sunRise/SunRise.svelte"

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
    min-height: 25vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
  }
</style>

<div class="wrapper">
  <TypeWriter speed={100} text={"Help....      We are dying!          Please help us kill the invading space ships and save us!"} />
  <GameLobby />
</div>

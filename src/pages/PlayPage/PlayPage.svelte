<script lang="ts">
  //Stores
  import { pageHasHeader } from "../../stores/stores"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"
  import GameLobby from "./components/GameLobby/GameLobby.svelte"

  pageHasHeader.set(true)
</script>

<style>
  .playPage {
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

<div class="playPage">
  <!-- <TypeWriter
    humanRandomeness
    speed={40}
    text={`Urgent plea for assistance!!        Our lives hang in the balance as we face a dire threat from invading space ships. We humbly implore your expertise and strength to aid us in combating this perilous situation and safeguarding our existence. Your valiant efforts would make all the difference in saving our lives.`}
  /> -->
  <GameLobby />
</div>

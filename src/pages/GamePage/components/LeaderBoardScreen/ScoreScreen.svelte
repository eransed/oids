<script lang="ts">
    import { gameState } from "../../../../lib/input"


  import ScoreRow from "./ScoreRow.svelte";

  $: remotePlayers = $gameState.scoreScreenData.remotePlayers
  $: player = $gameState.scoreScreenData.player
</script>

<style>
  .scoreTable {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    position: relative;
    inset: 0;
    margin: auto;
  }
  
  table {
    max-height: 70%;
    display: block;
    padding: 8px;
    font-weight: bold;
    font-size: 14px;
  }

</style>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <ScoreRow header={true}></ScoreRow>
      </tr>
    </thead>
    <tbody>
      <tr>
        <ScoreRow player={player} theLocalPlayer={true}></ScoreRow>
      </tr>
    </tbody>
    
    {#each remotePlayers as remotePlayer}
      <tbody>
        <tr>
          <ScoreRow player={remotePlayer}></ScoreRow>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

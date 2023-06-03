<script lang="ts">
  import { gameState } from "../Game/store/gameStores"

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
  }

  table,
  td {
    padding: 8px;
    font-weight: bold;
    font-size: 14px;
  }

</style>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <th colspan="1">Name</th>
        <th colspan="1">Kills</th>
        <th colspan="1">Hp</th>
        <!-- <th colspan="1">Alive</th> -->
        <!-- <th colspan="1">LastDamagedBy</th> -->
        <!-- <th colspan="1">KilledBy</th> -->
        <!-- <th colspan="1">Kills</th> -->
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
          <ScoreRow player={remotePlayer} theLocalPlayer={false}></ScoreRow>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

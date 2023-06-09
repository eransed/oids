<script lang="ts">
  import { gameState } from "../../../../lib/input"

  import ScoreRow from "./ScoreRow.svelte"

  export let showLocalPlayer = true

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
        <ScoreRow header={true} />
      </tr>
    </thead>
    {#if showLocalPlayer}
      <tbody>
        <tr>
          <ScoreRow {player} theLocalPlayer={true} />
        </tr>
      </tbody>
    {/if}

    {#each remotePlayers as remotePlayer}
      <tbody>
        <tr>
          <ScoreRow player={remotePlayer} />
        </tr>
      </tbody>
    {/each}
  </table>
</div>

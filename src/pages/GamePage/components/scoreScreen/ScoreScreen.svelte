<script lang="ts">
  import { gameState } from "../Game/store/gameStores"

  $: remotePlayers = $gameState.scoreScreenData.remotePlayers
  $: player = $gameState.scoreScreenData.player
</script>

<!-- <table>
  <thead></thead>
  <tr><th>Health</th><th>Alive</th></tr>
  <tr><th>{player.health}hp</th><th>{player.isDead}</th></tr>
</table> -->

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

  /* table,
  tr {
    padding: 20px;
  } */

  thead,
  tfoot {
    background-color: #333;
    color: #fff;
  }
</style>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <th colspan="1">Name</th>
        <th colspan="1">Hp</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="color: {player.color}; font-weight: bold; font-style: italic">{player.name}</td>
        <td>{player.health}</td>
      </tr>
    </tbody>

    {#each remotePlayers as player}
      <tbody>
        <tr>
          <td style="color: {player.color}">{player.name}</td>
          <td>{player.health}</td>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

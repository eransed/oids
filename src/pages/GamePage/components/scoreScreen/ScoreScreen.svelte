<script lang="ts">
  import type { ScoreScreenData } from "./ScoreScreen.types"
  export let ScoreScreenData: ScoreScreenData
</script>

<style>
  tr {
    border: 4px solid green;
  }
</style>

{#each ScoreScreenData.players as player}
  <table>
    <tr>
      <td>{player.name.toLocaleUpperCase()}: {player.alive ? "Alive" : "Dead"}</td>
    </tr>
  </table>
{/each}

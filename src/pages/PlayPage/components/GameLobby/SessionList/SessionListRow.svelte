<script lang="ts">
  import type { SpaceObject } from "../../../../../lib/interface"

  export let player: SpaceObject | null = null
  export let header = false
  export let numberOfPlayers: number = 0
</script>

<style>
  th,
  td {
    padding-right: 0.6rem;
  }
  td {
    padding-top: 0.6rem;
    font-weight: bold;
    font-size: 14px;
  }
</style>

{#if header}
  <th colspan="1">Host</th>
  <th colspan="1">Session</th>
  <th colspan="1">Nr Players</th>
{:else if player}
  <td>{player.name}</td>
  <td>{player.sessionId}</td>
  <td>{numberOfPlayers}</td>
{/if}

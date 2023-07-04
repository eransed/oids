<script lang="ts">
  import type { SpaceObject } from "../../../../../lib/interface"
  import { round2dec } from "mathil"

  export let player: SpaceObject | null = null
  export let theLocalPlayer = false
  export let header = false
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
  <th colspan="1">Name</th>
  <th colspan="1">Session</th>
  <th colspan="1">Ready</th>
{:else if player}
  {#if theLocalPlayer}
    <td style="color: {player.color}; font-weight: bold; font-style: italic">{player.name}</td>
  {:else}
    <td style="color: {player.color}">{player.name}</td>
  {/if}
  <td>{player.sessionId}</td>
  <td>{player.readyToPlay}</td>
{/if}

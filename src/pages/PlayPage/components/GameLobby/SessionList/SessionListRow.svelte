<script lang="ts">
  import type { SpaceObject } from "../../../../../lib/interface"

  export let player: SpaceObject | null = null
  export let header = false
  export let numberOfPlayers: number = 0
  export let localPlayer = false
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

{#if localPlayer}
  <style>
    td {
      color: #f00;
    }
  </style>
{:else}
  <style>
    td {
      color: #fff;
    }
  </style>
{/if}

{#if header}
  <th colspan="1">Host</th>
  <th colspan="1">Session</th>
  <th colspan="1">#players</th>
{:else if player}
  <td>{player.name}</td>
  <td>{player.sessionId}</td>
  <td>{numberOfPlayers}</td>
{/if}

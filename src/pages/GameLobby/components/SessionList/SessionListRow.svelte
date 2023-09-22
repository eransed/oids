<script lang="ts">
  import { navigate } from 'svelte-routing/src/history'
  import type { SpaceObject } from '../../../../lib/interface'

  export let player: SpaceObject | null = null
  export let header = false
  export let numberOfPlayers: number = 0
  export let localPlayer: boolean = false

  export let joinSession: ((so: SpaceObject | null) => void) | null = null
</script>

{#if header}
  <th colspan="1">Host</th>
  <th colspan="1">Session</th>
  <th colspan="1">#players</th>
{:else if player && localPlayer}
  <td style="color:#f00;">{player.name}</td>
  <td style="color:#f00;">{player.sessionId}</td>
  <td style="color:#f00;">{numberOfPlayers}</td>
  <td style="color:#f00;" />
{:else if player}
  <td>{player.name}</td>
  <td>{player.sessionId}</td>
  <td>{numberOfPlayers}</td>
  <td style="color:#f00;">
    <button
      on:click={() => {
        joinSession && joinSession(player)
      }}
      >Join game
    </button>
  </td>
{/if}

<style>
  th,
  td {
    padding-right: 0.6rem;
  }

  td {
    padding-top: 0.6rem;
    font-weight: bold;
    font-size: 14px;
    color: #ccc;
  }
</style>

<script lang="ts">
    import type { SpaceObject } from "../../../../lib/interface"
    import { round2dec } from "mathil"

    export let player: SpaceObject | null = null
    export let theLocalPlayer = false
    export let header = false

</script>
  
<style>
    th, td {
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
    <th colspan="1">Kills</th>
    <th colspan="1">Hp</th>
    <th colspan="1">Bounces</th>
    <th colspan="1">Battery</th>
    <th colspan="1">Joined</th>
    <th colspan="1">Session</th>

{:else if player}

    {#if theLocalPlayer}
        <td style="color: {player.color}; font-weight: bold; font-style: italic">{player.name}</td>
    {:else}
        <td style="color: {player.color}">{player.name}</td>
    {/if}
    <td>{player.killCount}</td>
    <td>{player.health}</td>
    <td>{player.bounceCount}</td>
    <td>{round2dec(player.batteryLevel, 0)}</td>
    <td>{player.joinedGame}</td>
    <td>{player.sessionId}</td>

{/if}


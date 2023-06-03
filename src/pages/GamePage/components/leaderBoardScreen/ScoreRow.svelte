<script lang="ts">
    import type { SpaceObject } from "../../../../lib/interface"

    export let player: SpaceObject
    export let theLocalPlayer: boolean
    // const killArray = Array.from(player.kills)

</script>
  
<style>
    td {
      padding: 8px;
      font-weight: bold;
      font-size: 14px;
    }
</style>

{#if theLocalPlayer}
    <td style="color: {player.color}; font-weight: bold; font-style: italic">{player.name}</td>
{:else}
    <td style="color: {player.color}">{player.name}</td>
{/if}
<td>{player.killCount}</td>
<td>{player.health}</td>
<td>{player.joinedGame}</td>
<td>{player.sessionId}</td>
<!-- <td>{player.serverVersion}</td> -->
<!-- <td>{!player.isDead}</td> -->
<!-- <td>{player.lastDamagedByName}</td> -->
<!-- <td>{player.killedByName}</td> -->
<!-- <td>{killArray.map(k => ' +' + k)}</td> -->

<script lang="ts">
    import type { Damageable, Player, Colorable, Fireable } from "../../../../lib/interface"

    export let player: Damageable & Player & Colorable & Fireable
    export let theLocalPlayer: boolean
    const killArray = Array.from(player.kills)

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
<!-- <td>{!player.isDead}</td> -->
<!-- <td>{player.lastDamagedByName}</td> -->
<!-- <td>{player.killedByName}</td> -->
<!-- <td>{killArray.map(k => ' +' + k)}</td> -->

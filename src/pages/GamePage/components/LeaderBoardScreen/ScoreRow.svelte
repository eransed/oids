<script lang="ts">
  import type { NonPlayerCharacter, SpaceObject } from '../../../../lib/interface'
  import { add2, newVec2, rndfVec2, round2, round2dec, smul2, sub2 } from 'mathil'
  import { localPlayer } from '../../../../stores/stores'
  import { worldStartPosition } from '../../../../lib/constants'
  import { getWorldCoordinates } from '../../../../lib/physics'
  function getCameraPos(n: NonPlayerCharacter | null) {
    if (n) {
      return n.cameraPosition
    }
    return newVec2()
  }
  export let player: SpaceObject | null = null
  export let serverObj: NonPlayerCharacter | null = null
  $: theObj = player ? player : serverObj
  // $: pos = round2(getWorldCoordinates(theObj), 0)
  $: pos = round2(getCameraPos(theObj), 0)
  export let theLocalPlayer = false
  export let header = false
  const teleOffset = 0
</script>

{#if header}
  <th colspan="1">Name</th>
  <th colspan="1">Kills</th>
  <th colspan="1">Hp</th>
  <th colspan="1">Bounces</th>
  <th colspan="1">X</th>
  <th colspan="1">Y</th>
  <th colspan="1">Battery</th>
  <th colspan="1">Joined</th>
  <th colspan="1">Session</th>
{:else if theObj}
  {#if theLocalPlayer}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <td
      class="clickable"
      title="Yes... this is you. Go home?"
      on:click={() => {
        $localPlayer.cameraPosition = add2(worldStartPosition, rndfVec2(-teleOffset, teleOffset))
      }}
      style="color: {theObj.color}; font-weight: bold; font-style: italic">{theObj.name}</td
    >
  {:else}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <td
      title="Teleport to player"
      class="clickable"
      on:click={() => {
        if (player) {
          $localPlayer.cameraPosition = player.cameraPosition
        } else if (serverObj) {
          $localPlayer.cameraPosition = sub2(add2(serverObj.cameraPosition, rndfVec2(-teleOffset, teleOffset)), $localPlayer.viewFramePosition)
        }
      }}
      style="color: {theObj.color}">{theObj.name}</td
    >
  {/if}
  <td>{theObj.killCount}</td>
  <td>{theObj.health}</td>
  <td>{theObj.bounceCount}</td>
  <td>{pos.x}</td>
  <td>{pos.y}</td>
  {#if player}
    <td>{round2dec(player.batteryLevel, 0)}</td>
    <td>{player.joinedGame}</td>
    <td>{player.sessionId}</td>
  {/if}
{/if}

<style>
  :scope {
    --transDelay: var(--transDelay);
  }
  th,
  td {
    padding-right: 0.6rem;
  }
  td {
    padding-top: 0.6rem;
    font-weight: bold;
    font-size: 14px;
    transition: all 500ms;
  }
  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    transition: all var(--transDelay);
    transform: scale(1.1);
  }
</style>

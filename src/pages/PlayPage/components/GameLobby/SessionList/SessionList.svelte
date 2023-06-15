<script lang="ts">
  import type { SpaceObject } from "../../../../../lib/interface"
  import SessionListRow from "./SessionListRow.svelte"

  export let player: SpaceObject
  export let remotePlayers: SpaceObject[]
</script>

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
    padding: 8px;
    font-weight: bold;
    font-size: 14px;
  }
</style>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <SessionListRow header={true} />
      </tr>
    </thead>

    <tbody>
      <tr>
        <SessionListRow {player} />
      </tr>
    </tbody>

    {#each remotePlayers as remotePlayer}
      <tbody>
        <tr>
          <SessionListRow player={remotePlayer} />
        </tr>
      </tbody>
    {/each}
  </table>
</div>

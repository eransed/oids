<script lang="ts">
  import type { Session, SpaceObject } from "../../../../../lib/interface"
  import SessionListRow from "./SessionListRow.svelte"

  export let sessions: Session[]
  export let localPlayer: SpaceObject
  export let joinSession: ((so: SpaceObject | null) => void) | null = null
</script>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <SessionListRow header={true} />
      </tr>
    </thead>

    {#each sessions as session}
      <tbody>
        <tr>
          <SessionListRow {joinSession} localPlayer={localPlayer.name === session.host.name} player={session.host} numberOfPlayers={session.players.length} />
        </tr>
      </tbody>
    {/each}
  </table>
</div>

<style>
  .scoreTable {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    inset: 0;
  }

  table {
    max-height: 70%;
    display: block;
    padding: 8px;
    font-weight: bold;
    font-size: 14px;
  }
</style>

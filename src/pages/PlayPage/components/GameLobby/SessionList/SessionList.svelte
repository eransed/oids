<script lang="ts">
  import type { Session, SpaceObject } from "../../../../../lib/interface"
  import SessionListRow from "./SessionListRow.svelte"

  export let sessions: Session[]
  
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

    {#each sessions as session}
      <tbody>
        <tr>
          <SessionListRow player={session.sessionHost} numberOfPlayers={session.players.length} />
        </tr>
      </tbody>
    {/each}
  </table>
</div>

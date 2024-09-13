<script lang="ts">
  import type { Session, SpaceObject } from '../../../../lib/interface'
  import SessionListRow from './SessionListRow.svelte'

  export let sessions: Session[]
  export let joinSession: ((sessionId: string) => void) | null = null
  export let localPlayer: SpaceObject | undefined
</script>

<table>
  <thead>
    <tr>
      <SessionListRow header={true} />
    </tr>
  </thead>

  {#each sessions as session}
    <tbody>
      <tr>
        <SessionListRow {joinSession} {session} {localPlayer} numberOfPlayers={session.players.length} />
      </tr>
    </tbody>
  {/each}
</table>

<style>
  table {
    /* max-height: 70%; */
    display: block;
    padding: 8px;
    font-weight: bold;
    font-size: 14px;
    margin-top: 1em;
    border-left: 1px solid var(--main-accent2-color);
  }

  @media screen and (max-width: 750px) {
    table {
      max-height: 30vh;
      overflow-y: auto;
    }
  }
</style>

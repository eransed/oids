<script lang="ts">
  import Button90 from '../../../../components/menu/Button90.svelte'
  import type { Session, SpaceObject } from '../../../../lib/interface'

  export let header = false
  export let numberOfPlayers: number = 0
  export let session: Session | undefined = undefined
  export let localPlayer: SpaceObject | undefined = undefined

  export let joinSession: ((sessionId: string) => void) | null = null
</script>

{#if header}
  <th colspan="1">Name</th>
  <th colspan="1">Players</th>
{:else if session}
  <td>{session.id}</td>
  <td>{numberOfPlayers}</td>
  <td style="color:#f00; transform: scale(0.8)">
    <Button90 disabled={session.id === localPlayer?.sessionId} borderBottom buttonConfig={{ buttonText: 'Join Game', clickCallback: () => joinSession && joinSession(session.id), selected: false }} />
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

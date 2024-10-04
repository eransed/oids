<script lang="ts">
  import Button90 from '../../../../components/menu/Button90.svelte'
  import { localPlayerStore } from '../../../../stores/stores'
  import { Icons } from '../../../../style/icons'
  import SessionList from '../SessionList/SessionList.svelte'
  import type { Session } from '../../../../lib/interface'
  import Info from '../../../../components/info/info.svelte'
  import { fade } from 'svelte/transition'

  export let sessions: Session[]
  export let joinSession_: ((sessionId: string) => void) | null = null
  export let startGame: (offlineGameId?: string) => void
</script>

{#if sessions.length > 0}
  <Info text="Space locations (Servers)" />
  <SessionList localPlayer={$localPlayerStore} joinSession={joinSession_} {sessions} />
{:else}
  <h5 style="padding: 1em;">Servers are offline...play locally?</h5>
  {@const offlineSessionId = 'Messier87'}
  <Button90
    addInfo="Play"
    icon={Icons.StartGame}
    buttonConfig={{
      buttonText: 'Play',
      clickCallback: () => startGame(offlineSessionId),
      selected: false,
    }}
  />
{/if}

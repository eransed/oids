<script lang="ts">
  import { onMount } from 'svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import Page from '../../components/page/page.svelte'
  import { getActiveSessions } from '../../lib/services/game/activeSessions'
  import { getPlayersInSession } from '../../lib/services/game/playersInSession'
  import { localPlayerStore } from '../../stores/stores'
  import { encode, decode } from '@msgpack/msgpack'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import Table from '../../components/table/Table.svelte'
  import type { Session } from '../../lib/interface'
  import { handleAxiosError } from '../../lib/services/utils/errorHandler'

  function encodedMsg() {
    console.log(encode($localPlayerStore, { forceFloat32: true }))
  }

  function sessionConverter(session: Session) {
    return {
      server: session.id,
      players: Object.values(session.players).map((v) => v.name),
    }
  }
</script>

<Page>
  <div class="buttonList">
    <Button90 borderBottom buttonConfig={{ buttonText: 'Get Binary Message', clickCallback: encodedMsg, selected: false }} />
    {#await getActiveSessions()}
      <p>Loading Sessions</p>
      <CircularSpinner />
    {:then sessions}
      <p>Sessions</p>
      <Table data={sessions} converter={sessionConverter} />
    {:catch error}
      <p>{error}</p>
    {/await}
  </div>
</Page>

<style>
  .buttonList {
    /* background-color: red; */
    padding: 1em;
    width: 100%;
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
</style>

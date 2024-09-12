<script lang="ts">
  import ShipCardInfo from '../../../../components/ships/ShipCardInfo.svelte'
  import type { Session } from '../../../../lib/interface'
  import { localPlayerStore, userStore } from '../../../../stores/stores'

  export let joinedSession: Session
</script>

<div class="sessionInfo">
  <p style={$localPlayerStore.sessionId === joinedSession.id ? 'color: #c89' : 'color: var(--main-text-color)'}>
    Server: {joinedSession.id}
  </p>

  <div class="shipCards" style="display: flex; flex-wrap: wrap">
    <!-- <ShipCardInfo shipOwner={joinedSession.host.name} chosenShip={joinedSession.host.ship} /> -->
    {#if $userStore}
      {#each $userStore.ships as shippy}
        <ShipCardInfo ship={shippy} clickedShip={(shippy) => ($localPlayerStore.ship = shippy)} />
      {/each}
    {:else}
      <ShipCardInfo ship={$localPlayerStore.ship} clickedShip={() => {}} />
    {/if}
  </div>
</div>

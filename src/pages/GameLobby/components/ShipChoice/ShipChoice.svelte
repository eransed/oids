<script lang="ts">
  import type { AlertType } from '../../../../components/alert/AlertType'
  import Button90 from '../../../../components/menu/Button90.svelte'
  import ShipCardInfo from '../../../../components/ships/ShipCardInfo.svelte'
  import { localPlayerStore, userStore } from '../../../../stores/stores'
  import { Icons } from '../../../../style/icons'
  import AddShip from '../../../ProfilePage/AddShip.svelte'

  let alert: AlertType | undefined = undefined

  let openModal = false
</script>

<div class="sessionInfo">
  <div class="shipCards" style="display: flex; flex-wrap: wrap">
    {#if $userStore}
      {#each $userStore.ships as shippy}
        <ShipCardInfo ship={shippy} clickedShip={(shippy) => ($localPlayerStore.ship = shippy)} />
      {/each}
      <!-- New ship button to create ship -->
      <div class="newShipButton">
        <Button90
          textColor="#000"
          icon={Icons.Add}
          addInfo="New Ship"
          buttonConfig={{
            buttonText: 'New ship',
            clickCallback: () => {
              openModal = true
            },
            selected: false,
          }}
        />
      </div>
      <AddShip
        {openModal}
        closeModal={(newShip) => {
          openModal = false
          if (newShip) {
            alert = {
              severity: 'success',
              text: `Save successful!`,
            }
          }
        }}
      />
    {:else}
      <ShipCardInfo ship={$localPlayerStore.ship} clickedShip={() => {}} />
    {/if}
  </div>
</div>

<style>
  @keyframes fly {
    0% {
      transform: translate(-25px);
      /* position: absolute; */
    }
    50% {
      transform: translateY(+25px) rotate(5deg);
    }
  }
  .newShipButton {
    color: var(--main-text-color);
    animation: fly 1s forwards;
    display: flex;
    align-content: center;
    flex-wrap: wrap;
    background-color: var(--main-accent-color);
    border-radius: 1.5em;
    transform: scale(0.8);
    height: 8.5em;
  }
  .shipCards {
    max-width: 45em;
  }
</style>

<script lang="ts">
  import CircularSpinner from '../../../../components/loaders/circularSpinner.svelte'
  import Button90 from '../../../../components/menu/Button90.svelte'
  import ShipCardInfo from '../../../../components/ships/ShipCardInfo.svelte'
  import { localPlayerStore, userStore } from '../../../../stores/stores'
  import { Icons } from '../../../../style/icons'
  import AddShip from '../../../../components/ships/AddShip.svelte'
  import { addAlert } from '../../../../stores/alertHandler'

  let openModal = $userStore?.ships.length === 0 ? true : false
</script>

<div class="sessionInfo">
  <div class="shipCards" style="display: flex; flex-wrap: wrap">
    {#if $userStore}
      {#each $userStore.ships as shippy}
        <ShipCardInfo ship={shippy} clickedShip={(shippy) => ($localPlayerStore.ship = shippy)} />
      {/each}
      <!-- New ship button to create ship -->
      {#if !openModal}
        <button class="newShipButton" on:click={() => (openModal = true)}>
          <Button90
            textColor="#000"
            icon={Icons.Add}
            addInfo="New Ship"
            buttonConfig={{
              buttonText: 'New ship',
              clickCallback: () => {
                //
              },
              selected: false,
            }}
          />
        </button>
      {:else}
        <div class="newShipButton modalOpen">
          <CircularSpinner />
        </div>
      {/if}
      {#if openModal}
        <AddShip
          {openModal}
          closeModal={(newShip) => {
            openModal = false
            if (newShip) {
              addAlert({
                severity: 'success',
                text: `Save successful!`,
              })
            }
          }}
        />
      {/if}
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
    border: none;
    border-radius: 2em;
    height: 8em;
    margin-top: 1.3em;
    width: 7em;
    transition: all 500ms;
  }

  .newShipButton:hover {
    background-color: var(--main-accent2-color);
    height: 10.3em;
    width: 9em;
    transition: all 500ms;
  }

  .modalOpen {
    background-color: var(--main-accent2-color);

    transition: all 500ms;
  }
  .shipCards {
    max-width: 45em;
  }
</style>

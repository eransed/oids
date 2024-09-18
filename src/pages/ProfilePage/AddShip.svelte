<script lang="ts">
  import { fade } from 'svelte/transition'

  //Components
  import ModalSimple from '../../components/modal/ModalSimple.svelte'

  //Services
  import { createShipService } from '../../lib/services/ship/ship.services'
  import getProfile from '../../lib/services/user/profile'
  import { ShipBundles } from '../../style/ships'
  // import type { Ship } from '@prisma/client'
  import { localPlayerStore, userStore } from '../../stores/stores'
  import { createShip } from '../../lib/factory'
  import type { Ship } from '../../lib/interface'
  import { ShipVariant } from '../../style/ships'

  //Props
  export let loading: boolean = false
  export let openModal: boolean = false
  export let closeModal: (newShip?: Ship) => void = () => {}
  export let cancelButton: boolean = true

  let newShipDone: boolean = false

  let newShip: Ship = createShip('new')

  async function handleNewShip(): Promise<void> {
    if (!$userStore) {
      throw new Error("Can't create a new ship if user not logged in")
    }

    newShip.id = $userStore.id
    loading = true

    return new Promise<void>((resolve, reject) => {
      createShipService(newShip)
        .then((response) => {
          if (response.status === 200) {
            $localPlayerStore.ship = response.data
            loading = false
            openModal = false
            closeModal(newShip)
            getProfile(newShip).then(() => {
              resolve()
            })
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  interface Step {
    //Desc = description
    desc: string
    completed: boolean
  }

  let chosenType = false

  $: nameStep = { desc: 'Name', completed: newShip.name.length > 1 ? true : false } as Step
  $: shipType = { desc: 'Ship Type', completed: chosenType } as Step
</script>

{#if openModal}
  <ModalSimple
    {cancelButton}
    steps={[nameStep, shipType]}
    title="Add a new ship to your collection"
    disabled={loading || !newShipDone}
    closeBtn={() => {
      closeModal()
      openModal = false
    }}
    saveBtn={async () => handleNewShip()}
    doneCallback={(done) => {
      if (done) {
        newShipDone = true
      } else {
        newShipDone = false
      }
    }}
  >
    <div style="display: flex; text-align:center; color: var(--main-text-color); display: flex; width: 100%" in:fade={{ duration: 250, delay: 50 }}>
      <h3 style="align-self: center">Name your ship:</h3>
      <input disabled={loading} bind:value={newShip.name} placeholder="Name 🚀 - Min 2 chars" />
    </div>
    <div style="width: 100%; color: var(--main-text-color)">
      <h3 style="align-self: center">Choose your ship type</h3>
    </div>

    {#each Object.values(ShipBundles) as Ship, i}
      <button
        title={ShipVariant[Ship.type]}
        class="imgCard"
        style="background: {Ship.type === newShip.variant && chosenType ? 'var(--main-accent2-color)' : ''};
  animation-delay: {150 * i}ms;"
        on:click={() => {
          newShip.variant = Ship.type
          chosenType = true
        }}
      >
        <img draggable="false" src={Ship.svgUrl} alt={Ship.svgUrl} style=" margin: 1em" /></button
      >
    {/each}
  </ModalSimple>
{/if}

<style>
  .imgCard {
    margin: 3%;
    min-width: 90px;
    background: none;
    border: none;
    width: 27%;
    display: flex;
    padding: 0.8em;
    align-content: center;
    justify-content: center;
    border-radius: 1em;
    z-index: 4;
    background: var(--main-accent-color);
    transition: all 500ms;
    animation: spin 1s ease-in-out forwards;
    transform: scale(0);
  }

  .imgCard img {
    width: 100%;
    min-width: 60px;
  }

  .imgCard:hover {
    transition: all 500ms;
    filter: contrast(120%);
    box-shadow: 0px 0px 2em var(--main-accent2-color);
    transform: skew(1deg) scale(1.3);
  }

  .imgCard:focus {
    scale: 1.05;
    transition: all 500ms;
  }

  @keyframes spin {
    0% {
      transform: rotate(-25deg) scale(0);
    }
    50% {
      transform: rotateY(180deg) scale(0.5) translate(-250px, 50px);
      box-shadow: 0px 0px 2em var(--main-accent2-color);
    }

    100% {
      transform: scale(1);
    }
  }

  @media screen and (max-width: 1300px) {
    .imgCard {
      min-width: unset;
      width: 19%;
    }

    .imgCard img {
      width: 100%;
      min-width: 35px;
    }
  }

  @media screen and (max-width: 750px) {
    .imgCard {
      margin: 3%;
      /* min-width: 30px; */
      background: none;
      border: none;
      width: 10%;
      display: flex;
      padding: 0.8em;
      align-content: center;
      justify-content: center;
      border-radius: 1em;
      z-index: 4;
      background: var(--main-accent-color);
      transition: all 500ms;
    }

    .imgCard img {
      width: 100%;
      min-width: 30px;
    }
  }

  @media screen and (max-width: 750px) and (min-width: 100px) {
    .imgCard {
      margin: 3%;
      /* min-width: 30px; */
      background: none;
      border: none;
      width: 35%;
      display: flex;
      padding: 0.8em;
      align-content: center;
      justify-content: center;
      border-radius: 1em;
      z-index: 4;
      background: var(--main-accent-color);
      transition: all 500ms;
    }

    .imgCard img {
      width: 100%;
      min-width: 30px;
    }
  }
</style>

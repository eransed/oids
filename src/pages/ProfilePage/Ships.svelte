<script lang="ts">
  import type { Ship } from '@prisma/client'
  import { formatDate } from '../../helpers/util'
  import { deleteShip, getShips, updateShip } from '../../lib/services/ship/ship.services'
  import getProfile from '../../lib/services/user/profile'
  import { user } from '../../stores/stores'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'
  import { Ships, getShipBundleCache } from '../../style/ships'
  import { fade } from 'svelte/transition'
  import { Icons } from '../../style/icons'
  import Button90 from '../../components/menu/Button90.svelte'

  export let loading: boolean = false
  let changeShip: Ship | undefined = undefined
  let updatedShipDone: boolean = false

  async function handleDeleteShip(id: string, name: string): Promise<void> {
    const result = confirm(`Want to delete ship: ${name}`)
    if (result) {
      const prompt = window.prompt(`Write ${name} in the box to delete it.`)
      if (prompt === name) {
        loading = true
        return new Promise<void>((resolve, reject) => {
          deleteShip(id)
            .then((response) => {
              if (response.status === 200) {
                loading = false
                changeShip = undefined
                getProfile().then(() => {
                  resolve()
                })
              }
            })
            .catch((err) => {
              loading = false
              reject(err)
            })
        })
      }
    }
  }

  async function handleSaveAvatar() {
    if (changeShip) {
      await updateShip(changeShip.name, changeShip.variant, changeShip.id).then((d) => {
        if (d.status === 200) {
          getProfile()
          changeShip = undefined
        }
      })
    }
  }
</script>

{#each $user.ships as ship, i}
  <div class="ship" style="animation-delay: {150 * i}ms;">
    <!-- svelte-ignore a11y-missing-attribute -->
    <button class="avatar" style="animation-delay: {150 * i}ms;" title="Edit Ship" on:click={() => (changeShip = ship)}>
      <img class="chosenAvatar" src={getShipBundleCache(ship.variant).svgUrl} />
    </button>

    <div class="shipInfo">
      <h4>
        {ship.name}
      </h4>
      <p style="font-style: italic">Created: {formatDate(ship.createdAt)}</p>
      <br />
      <p>Level {ship.level}</p>
      <p>Experience {ship.experience}</p>
      <br />
    </div>
  </div>
{/each}

{#if changeShip}
  <ModalSimple
    disabled={loading}
    doneCallback={() => (updatedShipDone = true)}
    title="Change your ship"
    saveBtn={async () => await handleSaveAvatar()}
    closeBtn={() => (changeShip = undefined)}
  >
    <div class="shipActions" style="position: absolute; top: 0; right: 0">
      <Button90
        disabled={loading}
        icon={Icons.Delete}
        mouseTracking={false}
        buttonConfig={{
          buttonText: 'Delete Ship',
          clickCallback: () => {
            if (changeShip) {
              handleDeleteShip(changeShip.id, changeShip.name)
            }
          },
          selected: false,
        }}
      />
    </div>
    <div style="display: flex; text-align:center; color: var(--main-text-color); display: flex; width: 100%">
      <h3 style="align-self: center">Ship name:</h3>
      <input disabled={loading} bind:value={changeShip.name} placeholder={changeShip.name} />
    </div>
    {#each Object.values(Ships) as Ship, i}
      <button
        class="imgCard"
        style=" background: {Ship.type === changeShip.variant ? 'var(--main-accent2-color)' : ''};
                  animation-delay: {150 * i}ms;"
        on:click={() => {
          if (changeShip) {
            changeShip.variant = Ship.type
          }
        }}><img draggable="false" src={Ship.svgUrl} alt={Ship.svgUrl} style=" margin: 1em" /></button
      >
    {/each}
  </ModalSimple>
{/if}

<style>
  .chosenAvatar {
    width: 6em;
    height: 6em;
  }

  .ship {
    padding: 1em;
    margin: 0.5em;
    display: grid;
    grid-template-columns: auto 2fr auto;
    flex-direction: row;
    border-radius: 0.5em;
    background-color: rgba(255, 166, 0, 0.025);
    flex-wrap: wrap;
    max-width: 100%;
    animation: fly 700ms ease-in-out;
  }

  .avatar {
    border: none;
    background: var(--main-accent2-color);
    border-radius: 1.5em;
    padding: 1em;
    width: 10em;
    height: 10em;
    animation: fly 700ms ease-in-out;
    transition: all 300ms;
  }

  .shipInfo {
    width: 100%;
    margin-left: 1em;
  }

  .avatar:hover {
    transition: all 300ms;
    filter: contrast(120%);
    box-shadow: 0px 0px 2em var(--main-accent2-color);
    transform: translateY(-2px);
  }

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

  @keyframes fly {
    50% {
      transform: translate(-10px);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(-25deg) scale(0);
    }
    50% {
      transform: rotateY(180deg) scale(0.5) translate(50px, -250px);
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

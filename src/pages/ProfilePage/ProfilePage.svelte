<script lang="ts">
  //Stores
  import { pageHasHeader, user, isLoggedIn, settings } from '../../stores/stores'
  import { profileComponent } from './ProfileButtons'

  //Components
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { ProfileButtons } from './ProfileButtons'

  //Util
  import { formatDate } from '../../helpers/util'
  import getProfile from '../../lib/services/user/profile'
  import { onMount } from 'svelte'
  import Modal from '../../components/modal/Modal.svelte'
  import { fade } from 'svelte/transition'
  import { createShip, deleteShip } from '../../lib/services/ship/ship.services'

  //Assets
  import { Icons } from '../../style/icons'

  onMount(() => {
    if ($isLoggedIn && !$user) {
      getProfile()
    }
  })

  pageHasHeader.set(true)

  let openModal: boolean = false

  let newShip = {
    name: '',
  }

  let loading: boolean = false

  async function handleNewShip(): Promise<void> {
    loading = true
    return new Promise<void>((resolve, reject) => {
      createShip(newShip.name)
        .then((response) => {
          if (response.status === 200) {
            loading = false
            openModal = false
            getProfile().then(() => {
              resolve()
            })
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

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
                openModal = false
                getProfile().then(() => {
                  resolve()
                })
              }
            })
            .catch((err) => {
              reject(err)
            })
        })
      }
    }
  }
</script>

<Page>
  <div class="profileWrapper">
    {#if $isLoggedIn && $user}
      <div class="buttons">
        {#each Object.values(ProfileButtons) as button}
          <div>
            <Button90 icon={button.icon} buttonConfig={button.config} selected={$profileComponent === button.config.routeParam} />
          </div>
        {/each}
      </div>
      <div class="content" style="padding: 1em">
        {#if $profileComponent === 'summary'}
          <div>
            <h3>{$user.name}</h3>
            <p>Created: <i>{formatDate($user.createdAt)}</i></p>
          </div>
          <br />

          <!-- <ProfileModal /> -->
        {/if}
        {#if $profileComponent === 'shipStation'}
          <h3>Your ships</h3>

          <div class="newShip"><button on:click={() => (openModal = true)} title="Add ship">+</button></div>
          {#if openModal}
            <div in:fade={{ duration: 250, delay: 50 }} out:fade={{ duration: 250 }} class="addUser">
              <p>Add a new ship to your collection</p>
              <input disabled={loading} bind:value={newShip.name} placeholder="Name" />
              <button disabled={loading} on:click={() => (openModal = false)}>Cancel</button>
              <button disabled={loading} on:click={() => handleNewShip()}>Save</button>
            </div>
          {/if}
          {#each $user.ships as ship}
            <div class="ship">
              <h4>
                {ship.name} <button disabled={loading} on:click={() => handleDeleteShip(ship.id, ship.name)}><i class="fa-regular fa-trash-can" /></button>
              </h4>
              <p style="font-style: italic">Created: {formatDate(ship.createdAt)}</p>
              <br />
              <p>Level {ship.level}</p>
              <p>Experience {ship.experience}</p>
              <br />
            </div>
          {/each}
        {/if}

        {#if $profileComponent === 'matchHistory'}
          <h3>Match History</h3>
          {#if $user.gameHistory}
            {#each Object.values($user.gameHistory) as game}
              <br />
              <p>Game Name: {game.sessionId}</p>
              <p><i>{formatDate(game.played)}</i></p>
              <p>{game.win ? 'Won' : 'Lost'}</p>
              <br />
            {/each}
          {/if}
        {/if}
        {#if $profileComponent === 'settings'}
          <table>
            <tr>
              <th>
                <p>Settings</p>
              </th>
            </tr>
            <tr>
              <td>Darkmode</td>
              <td
                ><button
                  on:click={() => {
                    $user.darkMode = !$user.darkMode
                    // $settings.darkMode = $user.darkMode
                  }}>{$user.darkMode}</button
                ></td
              >
            </tr>
          </table>
        {/if}
      </div>
    {:else}
      <div>
        <p style="color: var(--main-text-color)">Please login to see your profile</p>
        <ProfileModal />
      </div>
    {/if}
  </div>
</Page>

<style>
  table {
    border-collapse: collapse;
    width: 50%;
  }

  td,
  th {
    text-align: left;
    padding: 8px;
  }

  .profileWrapper {
    display: grid;
    justify-self: center;
    align-self: center;
    flex-wrap: wrap;
    color: #fff;
    grid-template-columns: 1fr auto;
    background-color: var(--main-card-color);
    border-radius: 0.5em;
    padding: 2em;
  }

  .content {
    color: var(--main-text-color);
    padding: 1em;
    min-width: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
    transition: all;
    transition-duration: 2s;
    border-left-style: ridge;
    border-left-width: 2px;
    border-left-color: var(--color);
    display: grid;
  }

  .buttons > * {
    margin: 0.5em;
  }

  .buttons {
    max-width: 100vw;
    overflow-y: auto;
    overflow-x: auto;
  }

  .ship {
    padding: 1em;
    margin: 0.5em;
    display: grid;
    border-radius: 0.5em;
    background-color: rgba(255, 166, 0, 0.025);
  }

  .newShip {
    display: grid;
    justify-self: end;
    position: absolute;
    top: 50px;
    width: 20px;
  }

  @media screen and (max-width: 750px) {
    .content {
      min-width: 0px;
      border: none;
    }
    .profileWrapper {
      grid-template-columns: 1fr;
    }

    .buttons {
      display: flex;
    }
  }

  @media screen and (max-width: 750px) and (min-width: 400px) {
    .profileWrapper {
      width: 100%;
      justify-items: center;
      grid-template-rows: auto 1fr;
      background-color: var(--main-bg-color);
    }
  }
</style>

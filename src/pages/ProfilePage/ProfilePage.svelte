<script lang="ts">
  //Stores
  import { pageHasHeader, user, isLoggedIn, settings } from '../../stores/stores'
  import { profileComponent } from './ProfileButtons'

  //Components
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { ProfileButtons } from './ProfileButtons'
  import Alert from '../../components/alert/Alert.svelte'

  //Util
  import { formatDate } from '../../helpers/util'
  import getProfile from '../../lib/services/user/profile'
  import { onMount } from 'svelte'
  import Modal from '../../components/modal/Modal.svelte'
  import { fade } from 'svelte/transition'
  import { createShip, deleteShip } from '../../lib/services/ship/ship.services'

  //Assets
  import { Icons } from '../../style/icons'
  import { Avatars } from '../../style/avatars'
  import { deleteMe } from '../../lib/services/user/delete'
  import { handleLogout } from '../../components/profile/profileButtons'
  import updateUser from '../../lib/services/user/updateUser'
  import type { User } from '@prisma/client'
  import type { AxiosResponse } from 'axios'
  import type { AlertType } from '../../components/alert/AlertType'

  onMount(() => {
    if ($isLoggedIn && !$user) {
      getProfile()
    }

    if ($user) {
      chosenAvatar = $user.image
    }
  })

  pageHasHeader.set(true)

  let openModal: boolean = false
  let alert: AlertType | undefined = undefined
  let newShip = {
    name: '',
  }

  let loading: boolean = false
  let editSettings: boolean = false
  let avatarDialog: boolean = false
  let chosenAvatar: string

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

  async function delUser() {
    const result = confirm(`Want to delete your account: ${$user.name}?`)
    if (result) {
      const prompt = window.prompt(`Write ${$user.name} in the box to delete user.`)
      if (prompt === $user.name) {
        loading = true

        await deleteMe()
          .then((res) => {
            if (res.status === 200) {
              handleLogout()
              alert = {
                severity: 'success',
                text: `Your account has been deleted forever :(`,
              }
              loading = false
            }
          })
          .catch((err) => {
            loading = false
            throw new Error(err)
          })
      }
    }
  }

  async function handleSaveSettings() {
    loading = true

    $user.image = chosenAvatar

    await updateUser($user)
      .then((d) => {
        if (d.status === 200) {
          editSettings = false
          loading = false
          getProfile()
        }
      })
      .catch((err) => {
        loading = false

        throw new Error(err)
      })
  }

  async function handleSaveAvatar() {
    console.log('handleSaveAvatar')

    await handleSaveSettings()
      .then((d) => {
        avatarDialog = false
        console.log('avatar saved')
      })
      .catch((err: Error) => {
        console.error(err)
        avatarDialog = false
        alert = {
          severity: 'error',
          text: err.message,
        }
      })
  }
</script>

<Page>
  <div class="profileWrapper">
    {#if alert}
      <Alert severity={alert.severity} text={alert.text} />
    {/if}

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
          <button title="Change avatar" class="avatar" on:click={() => (avatarDialog = true)}
            ><img class="chosenAvatar" src={$user.image} alt={Avatars.AstronautDog} /></button
          >
          {#if avatarDialog}
            <dialog open>
              <h3>Choose an avatar you want!</h3>
              <div class="dialogWrapper">
                {#each Object.values(Avatars) as Avatar}
                  <button
                    class="imgCard"
                    style="background: {Avatar === chosenAvatar ? 'var(--main-accent2-color)' : ''}"
                    on:click={() => (chosenAvatar = Avatar)}
                    ><img draggable="false" src={Avatar} alt={Avatar} style="height: 100%%; width: 100%; margin: 1em" /></button
                  >
                {/each}

                <div class="dialogButtons">
                  <Button90
                    minWidth={'0px'}
                    width={'45%'}
                    disabled={loading}
                    icon={Icons.Cancel}
                    mouseTracking={false}
                    buttonConfig={{
                      buttonText: 'Close',
                      clickCallback: async () => {
                        avatarDialog = false
                      },
                      selected: false,
                    }}
                  />

                  <Button90
                    minWidth={'0px'}
                    width={'45%'}
                    disabled={loading}
                    icon={Icons.Save}
                    mouseTracking={false}
                    buttonConfig={{
                      buttonText: 'Save',
                      clickCallback: async () => {
                        await handleSaveAvatar()
                      },
                      selected: false,
                    }}
                  />
                </div>
              </div>
            </dialog>
          {/if}
          <table>
            <tr>
              <th>
                <p>Settings</p>
                <div style="position: absolute; top: 8em; margin-left: 2.5em">
                  {#if !editSettings}
                    <Button90
                      disabled={loading}
                      icon={Icons.EditUser}
                      mouseTracking={false}
                      buttonConfig={{
                        buttonText: 'Edit User',
                        clickCallback: () => {
                          editSettings = true
                        },
                        selected: false,
                      }}
                    />
                  {/if}
                  {#if editSettings}
                    <Button90
                      disabled={loading}
                      icon={Icons.Save}
                      mouseTracking={false}
                      buttonConfig={{
                        buttonText: 'Save',
                        clickCallback: async () => {
                          await handleSaveSettings()
                        },
                        selected: false,
                      }}
                    />
                  {/if}
                </div>
              </th>
            </tr>
            <tr class="editable" style="opacity: 0.8;">
              <td />
            </tr>
            <hr style="border-color: var(--main-accent-color)" />
            <tr>
              <td>Delete my account</td>
              <td><button disabled={loading} on:click={() => delUser()}><i class="fa-regular fa-trash-can" /></button></td>
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
    border-left-color: var(--main-accent2-color);
    display: grid;
  }

  .avatar {
    border: none;
    background: var(--main-accent-color);
    border-radius: 1em;
    width: 25%;
  }

  dialog {
    padding: 2em;
    width: 50%;
    background: var(--main-card-color);
    border: none;
    border-radius: 1em;
    margin: auto;
    z-index: 1;
    text-align: center;
  }

  .dialogWrapper {
    padding: 2em;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    width: 100%;
    background: var(--main-card-color);
    border: none;
    border-radius: 1em;
  }

  .dialogWrapper .imgCard {
    max-width: 27%;
    margin: 3%;
    background: none;
    border: none;
    width: 100%;
    display: flex;
    padding: 0.8em;
    align-content: center;
    justify-content: center;
    border-radius: 1em;
    z-index: 4;
    background: var(--main-accent-color);
    transition: all 500ms;
  }

  .dialogWrapper .imgCard:hover {
    transition: all 500ms;
    filter: contrast(120%);
    box-shadow: 0px 0px 2em var(--main-accent2-color);
    transform: skew(1deg) scale(1.3);
  }

  .dialogWrapper .imgCard:focus {
    scale: 1.05;
    transition: all 500ms;
  }

  .dialogButtons {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: none;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-end;
  }

  .chosenAvatar {
    width: 6em;
    height: 6em;
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

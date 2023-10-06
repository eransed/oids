<script lang="ts">
  //Stores
  import { pageHasHeader, user, isLoggedIn } from '../../stores/stores'
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
  import { fade } from 'svelte/transition'
  import { createShip, deleteShip } from '../../lib/services/ship/ship.services'

  //Assets
  import { Icons } from '../../style/icons'
  import { Avatars } from '../../style/avatars'
  import { Ships } from '../../style/ships'
  import { deleteMe } from '../../lib/services/user/delete'
  import { handleLogout } from '../../components/profile/profileButtons'
  import updateUser from '../../lib/services/user/updateUser'
  import type { AlertType } from '../../components/alert/AlertType'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'

  onMount(() => {
    if ($isLoggedIn && !$user) {
      console.log('trying')
      getProfile()
    }
  })

  $: if ($user) {
    chosenAvatar = $user.image
  }

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

        alert = {
          severity: 'success',
          text: 'Your avatar is now updated!',
        }
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

{#if alert}
  <Alert severity={alert.severity} text={alert.text} />
{/if}
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
            <ModalSimple
              title="Add a new ship to your collection"
              disabled={loading}
              closeBtn={() => (openModal = false)}
              saveBtn={async () => handleNewShip()}
            >
              <div style="color: var(--main-text-color); display: flex; width: 100%" in:fade={{ duration: 250, delay: 50 }} out:fade={{ duration: 250 }}>
                <h3>Name your new ship 🚀</h3>
                <input disabled={loading} bind:value={newShip.name} placeholder="Name" />
              </div>

              {#each Object.values(Ships) as Ship, i}
                <button
                  class="imgCard"
                  style="background: {Ship === chosenAvatar ? 'var(--main-accent2-color)' : ''};
                  animation-delay: {150 * i}ms;"
                  on:click={() => (chosenAvatar = Ship)}><img draggable="false" src={Ship} alt={Ship} style=" margin: 1em" /></button
                >
              {/each}
            </ModalSimple>
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
            <ModalSimple title="Choose an avatar!" disabled={loading} saveBtn={async () => await handleSaveAvatar()} closeBtn={() => (avatarDialog = false)}>
              {#each Object.values(Avatars) as Avatar, i}
                <button
                  class="imgCard"
                  style="background: {Avatar === chosenAvatar ? 'var(--main-accent2-color)' : ''};
                  animation-delay: {150 * i}ms;"
                  on:click={() => (chosenAvatar = Avatar)}><img draggable="false" src={Avatar} alt={Avatar} style=" margin: 1em" /></button
                >
              {/each}
            </ModalSimple>
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
    background: var(--main-accent2-color);
    border-radius: 1.5em;
    width: 25%;
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
    .profileWrapper {
      width: 100%;
      justify-items: center;
      grid-template-rows: auto 1fr;
      background-color: var(--main-bg-color);
    }
  }
</style>

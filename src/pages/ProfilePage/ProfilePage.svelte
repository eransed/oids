<script lang="ts">
  //Stores
  import {
    pageHasHeaderStore,
    userStore,
    isLoggedInStore,
    settingsStore,
  } from '../../stores/stores'
  import { profileComponent } from './ProfileButtons'

  //Components
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { ProfileButtons } from './ProfileButtons'
  import Alert from '../../components/alert/Alert.svelte'
  import AddShip from './AddShip.svelte'
  import Ships from './Ships.svelte'

  //Util
  import { formatDate } from '../../utils/utils'
  import getProfile from '../../lib/services/user/profile'
  import { onMount } from 'svelte'
  import { handleLogout } from '../../utils/utils'

  //Assets
  import { Icons } from '../../style/icons'
  import { Avatars } from '../../style/avatars'

  //Services
  import { deleteMe } from '../../lib/services/user/delete'
  import updateUser from '../../lib/services/user/updateUser'

  //Component
  import type { AlertType } from '../../components/alert/AlertType'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'
  import { getThemeNumber, themes } from '../../style/defaultColors'
  import type { Theme } from '../../lib/interface'

  onMount(() => {
    if ($isLoggedInStore && !$userStore) {
      getProfile().then(() => {
        chosenTheme = themes[$userStore.theme]
      })
    }

    if($isLoggedInStore) {

      chosenTheme = themes[$userStore.theme]
    }
  })

  $: if ($userStore) {
    chosenAvatar = $userStore.image
  }

  pageHasHeaderStore.set(true)

  let openModal: boolean = false
  let alert: AlertType | undefined = undefined

  let loading: boolean = false
  let editSettings: boolean = false
  let avatarDialog: boolean = false
  let chosenAvatar: string
  let chosenTheme: Theme

  $: opacity = editSettings ? 1 : 0.5

  async function delUser() {
    const result = confirm(`Want to delete your account: ${$userStore.name}?`)
    if (result) {
      const prompt = window.prompt(
        `Write ${$userStore.name} in the box to delete user.`
      )
      if (prompt === $userStore.name) {
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

    const theme = getThemeNumber(chosenTheme)

    $userStore.image = chosenAvatar
    $userStore.theme = theme

    await updateUser($userStore)
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
    {#if $isLoggedInStore && $userStore}
      <div class="buttons">
        {#each Object.values(ProfileButtons) as button}
          <div>
            <Button90
              addInfo={button.config.buttonText}
              icon={button.icon}
              buttonConfig={button.config}
              selected={$profileComponent === button.config.routeParam}
            />
          </div>
        {/each}
      </div>
      <div class="content" style="padding: 1em; position: relative">
        {#if $profileComponent === 'shipStation'}
          <h3>Your ships</h3>

          <div class="newShip">
            <Button90
              addInfo={'Add ship'}
              disabled={loading}
              icon={Icons.Add}
              mouseTracking={false}
              buttonConfig={{
                buttonText: 'Add Ship',
                clickCallback: async () => {
                  openModal = true
                },
                selected: false,
              }}
            />
          </div>
          {#if openModal}
            <AddShip {openModal} closeModal={() => (openModal = false)} />
          {/if}

          <Ships />
        {/if}

        {#if $profileComponent === 'matchHistory'}
          <h3>Match History</h3>
          {#if $userStore.gameHistory}
            {#each Object.values($userStore.gameHistory) as game}
              <br />
              <p>Game Name: {game.sessionId}</p>
              <p><i>{formatDate(game.played)}</i></p>
              <p>{game.win ? 'Won' : 'Lost'}</p>
              <br />
            {/each}
          {/if}
        {/if}
        {#if $profileComponent === 'settings'}
          <div class="userHeader">
            <button
              title="Change avatar"
              class="avatar"
              on:click={() => (avatarDialog = true)}
              ><img
                class="chosenAvatar"
                src={$userStore.image}
                alt={Avatars.AstronautDog}
              /></button
            >
            <div class="userInfo">
              <h3>{$userStore.name}</h3>
              <p>Created: <i>{formatDate($userStore.createdAt)}</i></p>
            </div>
          </div>
          {#if avatarDialog}
            <ModalSimple
              title="Choose an avatar!"
              disabled={loading}
              saveBtn={async () => await handleSaveAvatar()}
              closeBtn={() => (avatarDialog = false)}
            >
              {#each Object.values(Avatars) as Avatar, i}
                <button
                  class="imgCard"
                  style="background: {Avatar === chosenAvatar
                    ? 'var(--main-accent2-color)'
                    : ''};
                  animation-delay: {150 * i}ms;"
                  on:click={() => (chosenAvatar = Avatar)}
                  ><img
                    draggable="false"
                    src={Avatar}
                    alt={Avatar}
                    style=" margin: 1em"
                  /></button
                >
              {/each}
            </ModalSimple>
          {/if}

          <table>
            <tr>
              <th>
                <p>Settings</p>
              </th>
              <th>
                <div class="settingsButtons">
                  {#if !editSettings}
                    <Button90
                      addInfo="Edit settings"
                      disabled={loading}
                      icon={Icons.EditUser}
                      mouseTracking={false}
                      buttonConfig={{
                        buttonText: 'Edit settings',
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
                      icon={Icons.Cancel}
                      mouseTracking={false}
                      buttonConfig={{
                        buttonText: 'Cancel',
                        clickCallback: async () => {
                          editSettings = false
                        },
                        selected: false,
                      }}
                    />
                    <Button90
                      addInfo="Save changes"
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

            <!-- <td><input disabled={loading} on:keypress={onKeyPress} bind:value={email} /></td> -->
            <tr style="opacity: {opacity};">
              <td>Name</td>
              <td
                ><input
                  disabled={!editSettings}
                  bind:value={$userStore.name}
                /></td
              >
            </tr>
            <tr style="opacity: {opacity};">
              <td>Email</td>
              <td
                ><input
                  disabled={!editSettings}
                  bind:value={$userStore.email}
                /></td
              >
            </tr>
            <tr style="opacity: {opacity};">
              <td>Theme</td>
              <td>
                <select disabled={!editSettings} bind:value={chosenTheme}>
                  {#each themes as value}
                    <option {value}>
                      {value.name}
                    </option>
                  {/each}
                </select>
              </td>
            </tr>

            <tr>
              <td colspan="2">
                <hr
                  style="width: 100%; border-color: var(--main-accent-color); opacity: 0.5"
                />
              </td>
            </tr>
            <tr>
              <td>Delete account</td>
              <!-- <td><button disabled={loading} on:click={() => delUser()}><i class="fa-regular fa-trash-can" /></button></td>
               -->
              <td>
                <Button90
                  disabled={loading}
                  icon={Icons.Delete}
                  mouseTracking={false}
                  buttonConfig={{
                    buttonText: 'Delete User',
                    clickCallback: () => {
                      delUser()
                    },
                    selected: false,
                  }}
                />
              </td>
            </tr>
          </table>
        {/if}
      </div>
    {:else}
      <div>
        <p style="color: var(--main-text-color)">
          Please login to see your profile
        </p>
        <ProfileModal />
      </div>
    {/if}
  </div>
</Page>

<style>
  .userHeader {
    display: flex;
    height: 8em;
    margin-bottom: 1em;
  }

  .userInfo {
    padding: 1em;
    width: 50%;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  :scope {
    --opacity: 0.5;
  }

  td,
  th {
    text-align: left;
    padding: 8px;
  }

  .settingsButtons {
    display: flex;
    /* position: absolute; */
    top: 8em;
    /* margin-left: 2.5em; */
    justify-content: flex-start;
    width: 35%;
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
    min-width: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
    transition: all;
    transition-duration: 2s;
    border-left-style: ridge;
    border-left-width: 2px;
    border-left-color: var(--main-accent2-color);
    display: grid;
    max-width: 500px;
  }

  .avatar {
    border: none;
    background: var(--main-accent2-color);
    border-radius: 1.5em;
    width: 28%;
    transition: all 500ms;
  }

  .avatar:hover {
    transform: scale(1.05) translateY(5px);
    transition: all 500ms;
    box-shadow: 0px 0px 1em var(--main-accent2-color);
  }

  .imgCard {
    margin: 3%;
    /* min-width: 180px; */
    background: none;
    border: none;
    width: 25%;
    display: flex;
    padding: 0.8em;
    align-content: flex-start;
    justify-content: center;
    border-radius: 1em;
    z-index: 4;
    background: var(--main-accent-color);
    transition: all 500ms;
    animation: spin 1s ease-in-out forwards;
    transform: scale(0);
    height: fit-content;
  }

  .imgCard img {
    width: 100%;
    /* min-width: 60px; */
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

  .newShip {
    display: grid;
    justify-self: end;
    position: absolute;
    top: 0px;
    right: 0.8em;
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

<script lang="ts">
  //Stores
  import { pageHasHeader, user, isLoggedIn, settings } from '../../stores/stores'
  import { profileComponent } from './ProfileButtons'

  //Components
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { ProfileButtons } from './ProfileButtons'
  import Card from '../../components/card/card.svelte'

  //Util
  import { formatDate } from '../../helpers/util'
  import getProfile from '../../lib/services/user/profile'
  import { onMount } from 'svelte'

  onMount(() => {
    if ($isLoggedIn && !$user) {
      getProfile()
    }
  })

  pageHasHeader.set(true)
</script>

<Page>
  <div class="profileWrapper">
    {#if $isLoggedIn && $user}
      <div class="buttons">
        {#each Object.values(ProfileButtons) as button}
          <div>
            <Button90 buttonConfig={button} selected={$profileComponent === button.routeParam} />
          </div>
        {/each}
      </div>
      <div class="content" style="padding: 1em">
        {#if $profileComponent === 'summary'}
          <div>
            <h3>{$user.name}</h3>
            <p>Created: <i>{formatDate($user.createdAt)}</i></p>
          </div>

          <!-- <ProfileModal /> -->
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
                    $settings.darkMode = $user.darkMode
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
  }

  .buttons > * {
    margin: 0.5em;
  }

  .buttons {
    max-width: 100vw;
    overflow-y: auto;
    overflow-x: auto;
  }

  @media screen and (max-width: 500px) {
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
</style>

<script lang="ts">
  //Stores
  import { pageHasHeader, user } from '../../stores/stores'
  import { profileComponent } from './ProfileButtons'

  //Components
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { ProfileButtons } from './ProfileButtons'

  //Util
  import { formatDate } from '../../helpers/util'

  console.log($user)

  pageHasHeader.set(true)
</script>

<Page>
  {#if $user}
    <div class="profileWrapper">
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
          <br />
          <hr />
          <br />
          <div>
            <h3>Games</h3>
            {#if $user.gameHistory}
              {#each Object.values($user.gameHistory) as game}
                <br />
                <p>Game Name: {game.id}</p>
                <p><i>{formatDate(game.played)}</i></p>
                <p>{game.win ? 'Won' : 'Lost'}</p>
                <br />
              {/each}
            {/if}
          </div>
          <!-- <ProfileModal /> -->
        {/if}
        {#if $profileComponent === 'matchHistory'}
          <p>Match History</p>
        {/if}
        {#if $profileComponent === 'settings'}
          <p>Settings</p>
        {/if}
      </div>
    </div>
  {:else}
    <p style="color: #fff">Please login to see your profile</p>
    <ProfileModal />
  {/if}
</Page>

<style>
  .profileWrapper {
    display: grid;
    justify-self: center;
    align-self: center;
    flex-wrap: wrap;
    color: #fff;
    grid-template-columns: 1fr auto;
  }

  .content {
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

  @media screen and (max-width: 600px) {
    .profileWrapper {
      grid-template-columns: 1fr;
    }

    .buttons {
      display: flex;
    }
  }
</style>

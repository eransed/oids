<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"
  import { Route, Router } from "svelte-routing"

  //Stores
  import { pageHasHeader, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Components
  import ProfileModal from "../../components/profile/ProfileModal.svelte"
  import Page from "../../components/page/page.svelte"
  import Button90 from "../../components/menu/Button90.svelte"
  import { ProfileButtons } from "./ProfileButtons"

  pageHasHeader.set(true)

  let userData: User | undefined

  user.subscribe((v) => {
    userData = v
  })

  export let params: String
</script>

<style>
  .profileHeader {
    display: grid;
    justify-self: center;
    align-self: center;
    flex-wrap: wrap;
    color: #fff;
    font-family: "Courier New", Courier, monospace;
    grid-template-columns: 1fr auto;
  }

  .content {
    padding: 1em;
    min-width: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
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
    .profileHeader {
      grid-template-columns: 1fr;
    }

    .buttons {
      display: flex;
    }
  }
</style>

{#if $user}
  <Page>
    <div class="profileHeader">
      <div class="buttons">
        <div>
          <Button90 buttonConfig={ProfileButtons.summary} selected={params === "summary"} />
        </div>
        <div>
          <Button90 buttonConfig={ProfileButtons.matchHistory} selected={params === "matchHistory"} />
        </div>
        <div>
          <Button90 buttonConfig={ProfileButtons.settings} selected={params === "settings"} />
        </div>
      </div>
      <div class="content" style="padding: 1em">
        {#if params === "summary"}
          <ProfileModal />
        {/if}
        {#if params === "matchHistory"}
          <p>Match History</p>
        {/if}
        {#if params === "settings"}
          <p>Settings</p>
        {/if}
      </div>
    </div>
  </Page>
{:else}
  <Page>
    <p style="color: #fff">Please login to see your profile</p>
    <ProfileModal />
  </Page>
{/if}

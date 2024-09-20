<script lang="ts">
  //Stores
  import { pageHasHeaderStore, localPlayerStore } from '../../stores/stores'
  import { settingsComponent } from './SettingsButtons'

  //Components
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { SettingsButtons } from './SettingsButtons'
  //Util
  import { onDestroy, onMount } from 'svelte'

  //Component
  import type { AlertType } from '../../components/alert/AlertType'
  import { arcadeKeyMapManagerStore, initKeyControllers, removeKeyControllers, spaceKeyMapManagerStore } from '../../lib/input'
  import { GameMode } from '../../lib/interface'
  import HotkeysPage from './HotkeysPage.svelte'

  onMount(() => {
    initKeyControllers()
  })

  onDestroy(() => {
    removeKeyControllers()
  })

  pageHasHeaderStore.set(true)
</script>

<Page>
  <div class="settingsWrapper">
    <div class="buttons">
      {#each Object.values(SettingsButtons) as button}
        <div>
          <Button90 addInfo={button.config.buttonText} icon={button.icon} buttonConfig={button.config} selected={$settingsComponent === button.config.routeParam} />
        </div>
      {/each}
    </div>
    {#if $settingsComponent === SettingsButtons.controlsSpace.config.routeParam}
      <HotkeysPage keyMapManager={$spaceKeyMapManagerStore} />
    {/if}
    {#if $settingsComponent === SettingsButtons.controlsArcade.config.routeParam}
      <HotkeysPage keyMapManager={$arcadeKeyMapManagerStore} />
    {/if}
  </div>
</Page>

<style>
  :scope {
    --opacity: 0.5;
  }

  .settingsWrapper {
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

  .buttons > * {
    margin: 0.5em;
  }

  .buttons {
    max-width: 100vw;
    overflow-y: auto;
    overflow-x: auto;
  }

  @media screen and (max-width: 750px) {
    .settingsWrapper {
      grid-template-columns: 1fr;
    }

    .buttons {
      display: flex;
    }
  }

  @media screen and (max-width: 750px) and (min-width: 100px) {
    .settingsWrapper {
      width: 100%;
      justify-items: center;
      grid-template-rows: auto 1fr;
      background-color: var(--main-bg-color);
    }
  }
</style>

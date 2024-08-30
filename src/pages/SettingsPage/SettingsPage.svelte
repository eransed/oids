<script lang="ts">
  //Stores
  import { pageHasHeaderStore, localPlayerStore } from '../../stores/stores'
  import { settingsComponent } from './SettingsButtons'

  //Components
  import Page from '../../components/page/page.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import { SettingsButtons } from './SettingsButtons'
  import Alert from '../../components/alert/Alert.svelte'

  //Util
  import { onDestroy, onMount } from 'svelte'

  //Component
  import type { AlertType } from '../../components/alert/AlertType'
  import HotKeys from '../GamePage/components/Hotkeys/hotKeys.svelte'
  import { DefaultArcadeModeKeyMap, DefaultSpaceModeKeyMap, initKeyControllers, keyFuncArrayFromKeyFunctionMap, removeKeyControllers, savedHotkeysStore } from '../../lib/input'
  import { GameMode } from '../../lib/game'

  onMount(() => {
    initKeyControllers()
  })

  onDestroy(() => {
    removeKeyControllers()
  })

  pageHasHeaderStore.set(true)

  let alerto: AlertType
</script>

{#if alerto}
  <Alert severity={alerto.severity} text={alerto.text} />
{/if}
<Page>
  <div class="profileWrapper">
    <div class="buttons">
      {#each Object.values(SettingsButtons) as button}
        <div>
          <Button90 addInfo={button.config.buttonText} icon={button.icon} buttonConfig={button.config} selected={$settingsComponent === button.config.routeParam} />
        </div>
      {/each}
    </div>
    {#if $settingsComponent === SettingsButtons.controlsSpace.config.routeParam}
      <div class="content" style="padding: 1em; position: relative">
        <table>
          <tr>
            <th>
              <h3>Hotkeys - Using Ship</h3>
            </th>
          </tr>
          <tr>
            <td>
              <HotKeys Mode={GameMode.SPACE_MODE} activeColor={$localPlayerStore.color} keyFunctionMap={$savedHotkeysStore?.spaceMode ? $savedHotkeysStore.spaceMode : DefaultSpaceModeKeyMap} />
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <hr style="width: 100%; border-color: var(--main-accent-color); opacity: 0.5" />
            </td>
          </tr>
        </table>
      </div>
    {/if}
    {#if $settingsComponent === SettingsButtons.controlsArcade.config.routeParam}
      <div class="content" style="padding: 1em; position: relative">
        <table>
          <tr>
            <th>
              <h3>Hotkeys - Player Mode (Arcade)</h3>
            </th>
          </tr>
          <tr>
            <td>
              <HotKeys Mode={GameMode.ARCADE_MODE} activeColor={$localPlayerStore.color} keyFunctionMap={$savedHotkeysStore?.arcadeMode ? $savedHotkeysStore.arcadeMode : DefaultArcadeModeKeyMap} />
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <hr style="width: 100%; border-color: var(--main-accent-color); opacity: 0.5" />
            </td>
          </tr>
        </table>
      </div>
    {/if}
  </div>
</Page>

<style>
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
    .profileWrapper {
      width: 100%;
      justify-items: center;
      grid-template-rows: auto 1fr;
      background-color: var(--main-bg-color);
    }
  }
</style>

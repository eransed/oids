<script lang="ts">
  import Button90 from '../../components/menu/Button90.svelte'
  import { activeHotKeys, arcadeKeyMapManagerStore, keyFuncArrayFromKeyFunctionMap, spaceKeyMapManagerStore } from '../../lib/input'
  import { GameMode, type KeyFunctionMap, type KeyMapManager } from '../../lib/interface'
  import { localPlayerStore } from '../../stores/stores'
  import HotKeys from '../GamePage/components/Hotkeys/hotKeys.svelte'
  import { Icons } from '../../style/icons'

  import { ActiveKeyMapStore } from '../../lib/input'
  import { resetKeyMapToDefault } from '../GamePage/components/Hotkeys/hotKeysChange'

  export let keyMapManager: KeyMapManager
</script>

<div class="content" style="padding: 1em; position: relative">
  <table>
    <tr>
      <th>
        <h3>Hotkeys - {$ActiveKeyMapStore.name}</h3>
        {#if keyMapManager.getKeyMap().name !== 'Space' && keyMapManager.getKeyMap().name !== 'Arcade'}
          <div style="position: absolute; top: 0; right: 25px">
            <Button90
              buttonType="button"
              icon={Icons.Reset}
              addInfo={`Reset default to: ${keyMapManager.getDefault().name}`}
              buttonConfig={{ buttonText: `Reset to default: ${keyMapManager.getDefault().name}`, clickCallback: () => resetKeyMapToDefault(keyMapManager), selected: false }}
            />
          </div>
        {/if}
      </th>
    </tr>
    <tr>
      <td>
        <HotKeys
          Mode={$localPlayerStore.gameMode}
          activeColor={$localPlayerStore.color}
          keyMapManager={$localPlayerStore.gameMode === GameMode.SPACE_MODE ? $spaceKeyMapManagerStore : $arcadeKeyMapManagerStore}
        />
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <hr style="width: 100%; border-color: var(--main-accent-color); opacity: 0.5" />
      </td>
    </tr>
  </table>
</div>

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

  @media screen and (max-width: 750px) {
    .content {
      min-width: 0px;
      border: none;
    }
  }
</style>

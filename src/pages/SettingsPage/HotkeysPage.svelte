<script lang="ts">
  import Button90 from '../../components/menu/Button90.svelte'
  import { GameMode, type KeyFunctionMap, type KeyMapManager } from '../../lib/interface'
  import { localPlayerStore } from '../../stores/stores'
  import HotKeys from '../GamePage/components/Hotkeys/hotKeys.svelte'

  export let mode: GameMode
  export let keyMapManager: KeyMapManager

  let keyMap = keyMapManager.getKeyMap()
</script>

<div class="content" style="padding: 1em; position: relative">
  <table>
    <tr>
      <th>
        <h3>Hotkeys - {keyMap.name}</h3>
        <Button90 buttonType="button" buttonConfig={{ buttonText: 'Test', clickCallback: () => keyMapManager.resetKeyMap(), selected: false }} />
      </th>
    </tr>
    <tr>
      <td>
        <HotKeys Mode={mode} activeColor={$localPlayerStore.color} {keyMapManager} />
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

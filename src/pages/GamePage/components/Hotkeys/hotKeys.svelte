<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import ModalSimple from '../../../../components/modal/ModalSimple.svelte'
  import { ActiveKeyMapStore, keyDisplayName as keyDisplayText, keyFuncArrayFromKeyFunctionMap } from '../../../../lib/input'
  import { submitHotkeyChange } from './hotKeysChange'
  import type { KeyFunction, KeyFunctionMap, KeyFunctionStore, KeyMapManager } from '../../../../lib/interface'
  import { GameMode } from '../../../../lib/interface'
  import { activeHotKeys } from '../../../../lib/input'

  //Params
  export let activeColor: string
  export let Mode: GameMode
  export let keyMapManager: KeyMapManager

  $: keyFunctions = keyFuncArrayFromKeyFunctionMap(keyMapManager.getKeyMap())
  let changeKey: KeyFunctionStore | undefined

  function keydown(event: KeyboardEvent) {
    if (!changeKey) {
      return
    }

    keyFunctions = submitHotkeyChange({
      chosenKey: event.key,
      keyFunction: changeKey,
      del: false,
      mode: Mode,
      keyMapManager,
    })

    changeKey = undefined
  }

  onMount(() => {
    document.addEventListener('keydown', keydown)
  })

  onDestroy(() => {
    document.removeEventListener('keydown', keydown)
  })
</script>

<div class="hotKeyTable">
  <table>
    <thead>
      <tr>
        <th style="color: {activeColor}" colspan="1">Function</th>
        <th style="color: {activeColor}" colspan="1">Key</th>
        <th style="color: {activeColor}" colspan="1">Type</th>
      </tr>
    </thead>

    {#each keyFunctions as keyFunction, i}
      <tbody class="keyRow">
        <tr>
          {#if typeof keyFunction !== 'string'}
            {#if $activeHotKeys[i].keyStatus}
              <td style="color: {activeColor}">{'+ ' + keyFunction.displayText}</td>
            {:else}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <td style="color: 'grey'">{'- ' + keyFunction.displayText}</td>
            {/if}
            <td style="display: flex; gap: 0.5em">
              <button class="addKey buttonStyle" on:click={() => (changeKey = keyFunction)}>+</button>
              {#if changeKey === keyFunction}
                <ModalSimple saveButton={false} closeBtn={() => (changeKey = undefined)}>
                  <span style="text-align: center;">
                    <table style="width: 100%;">
                      <th><h3>{keyFunction.displayText}</h3></th>

                      <tr>
                        <td>Hotkeys:</td><td
                          >{#each keyFunction.activators as activator}{activator} /
                          {/each}</td
                        >
                      </tr>
                    </table>

                    <h3 style="padding: 1em;">
                      Press a key to assign to {keyFunction.displayText}
                    </h3>
                  </span>
                </ModalSimple>
              {/if}
              {#each keyFunction.activators as activator}
                <button
                  title="Click to delete!"
                  on:click={() =>
                    (keyFunctions = submitHotkeyChange({
                      chosenKey: activator,
                      keyFunction: keyFunction,
                      del: true,
                      mode: Mode,
                      keyMapManager,
                    }))}
                  style={$activeHotKeys[i].keyStatus ? `background-color: ${activeColor}` : ''}
                  class="buttonStyle">{keyDisplayText(activator)}</button
                >
              {/each}
              {#if keyFunction.activators.length === 0}
                <p style="color: red;">No button assigned!</p>
              {/if}
            </td>
            <td>{keyFunction.toggle ? '<toggle>' : '<momentary>'}</td>
          {/if}
        </tr>
      </tbody>
    {/each}
  </table>
</div>

<style>
  .buttonStyle {
    padding: 0.15em;
  }

  .keyRow:hover .addKey {
    visibility: visible;
  }

  .addKey {
    visibility: hidden;
  }

  .hotKeyTable {
    display: flex;
    justify-content: flex-start;
    align-content: center;
    flex-wrap: wrap;
    position: relative;
    inset: 0;
    margin: auto;
  }

  table,
  td {
    padding: 3px;
    font-weight: bold;
    font-size: 14px;
  }
</style>

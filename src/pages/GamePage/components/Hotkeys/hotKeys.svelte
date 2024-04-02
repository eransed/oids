<script lang="ts">
  import {
    activeKeyStates,
    keyDisplayName as keyDisplayText,
  } from '../../../../lib/input'
  import type { KeyFunction } from '../../../../lib/interface'
  import { submitHotkeyChange } from './hotKeysChange'
  export let activeColor: string


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

    {#each $activeKeyStates as keyFunction}
      <tbody class="keyRow">
        <tr>
          {#if keyFunction.keyStatus}
            <td style="color: {activeColor}"
              >{'+ ' + keyFunction.displayText}</td
            >
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <td style="color: 'grey'">{'- ' + keyFunction.displayText}</td>
          {/if}
          <td style="display: flex; gap: 0.5em">
            <button class="addKey buttonStyle">+</button>
            {#each keyFunction.activators as activator}
              <button on:click={() => submitHotkeyChange({keyFunction: keyFunction, activator: activator, del: true})} style={keyFunction.keyStatus ? `background-color: ${activeColor}` : ''} class="buttonStyle">{keyDisplayText(activator)}</button>
            {/each}
          </td>
          <td>{keyFunction.toggle ? '<toggle>' : '<momentary>'}</td>
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

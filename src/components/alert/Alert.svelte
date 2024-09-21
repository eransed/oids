<script lang="ts">
  import { fade } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import type { AlertType } from './AlertType'
  import { alertStore } from '../../stores/alertHandler'

  /**
   * @param severity - error, warning, info, success
   * @description An alert popup with different colors
   */

  interface InternalAlert extends AlertType {
    active: boolean
  }

  $: alertList = $alertStore as InternalAlert[]
</script>

{#each alertList.filter((alert) => alert.active) as alert, i}
  {#if alert.active}
    <div in:fade={{ delay: 50, duration: 250 }} style=" display: grid">
      <div class="alertBox" style="position: absolute; bottom: {i * 20 + 'px'};--theme-color: {alertColors[alert.severity]}">
        <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => (alert.active = false)}>x</button>
        <p><b>{alert.severity.toUpperCase()}</b></p>
        <p>{alert.text}</p>
      </div>
    </div>
  {/if}
{/each}

<style>
  .alertBox {
    position: absolute;
    justify-self: felx;
    background-color: var(--theme-color);
    color: #000;
    padding: 1em;
    min-width: 200px;
    width: -moz-fit-content;
    width: fit-content;
    max-width: 30%;
    height: fit-content;
    max-height: 300px;
    font-size: 12px;
    border-radius: 0.8em;
    z-index: 4;
    opacity: 1;
    right: 0;
    /* inset: 0;
    margin: auto; */
    margin-top: 300px;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

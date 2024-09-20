<script lang="ts">
  import { fade } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import type { AlertType } from './AlertType'

  /**
   * @param severity - error, warning, info, success
   * @description An alert popup with different colors
   */
  export let severity: AlertType['severity'] = 'info'
  export let text: AlertType['text'] = ''

  $: if (text) {
    color = alertColors[severity]
    setTimeout(() => {
      text = ''
    }, 5000)
  }

  let color = alertColors[severity]
</script>

{#if text}
  <div in:fade={{ delay: 50, duration: 250 }} style="display: grid">
    <div class="alertBox" style="--theme-color: {color}">
      <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => (text = '')}>x</button>
      <p><b>{severity.toUpperCase()}</b></p>
      <p>{text}</p>
    </div>
  </div>
{/if}

<style>
  .alertBox {
    position: fixed;
    justify-self: center;
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
    inset: 0;
    margin: auto;
    margin-top: 300px;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

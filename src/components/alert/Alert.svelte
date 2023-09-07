<script lang="ts">
  import { fade } from 'svelte/transition'

  /**
   * @param severity - error, warning, info, success
   * @description An alert popup with different colors
   */
  export let severity: 'error' | 'warning' | 'info' | 'success' = 'info'
  export let text: string = ''

  $: if (text) {
    color = colors[severity]
    setTimeout(() => {
      text = ''
    }, 3500)
  }

  const colors = {
    error: '#fdeded',
    warning: '#fff4e5',
    info: '#e5f6fd',
    success: '#bbffbb',
  }
  let color = colors[severity]
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
    padding: 1em;
    min-width: 200px;
    font-size: 12px;
    border-radius: 0.8em;
    z-index: 2;
    opacity: 0.9;
    top: 25%;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

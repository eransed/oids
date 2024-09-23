<script lang="ts">
  import { fly } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import { alertStore } from '../../stores/alertHandler'

  $: alerts = $alertStore.filter((alert) => alert.active)
</script>

{#each alerts as alert, i}
  <div in:fly={{ duration: 1000, y: 300 }} class="alertBox" style="z-index: {100 - i}; bottom: {i * 20 + 'px'}; --theme-color: {alertColors[alert.severity]}">
    <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => (alert.active = false)}>x</button>
    <p><b>{alert.severity.toUpperCase()}</b></p>
    <p>{alert.text}</p>
  </div>
{/each}

<style>
  .alertBox {
    position: absolute;
    background-color: var(--theme-color);
    color: #000;
    padding: 1em;
    min-width: 300px;
    width: -moz-fit-content;
    width: fit-content;
    max-width: 30%;
    height: fit-content;
    max-height: 300px;
    font-size: 12px;
    border-radius: 0.8em;
    z-index: 4;
    opacity: 1;
    right: 5px;
    bottom: 5px;
    /* inset: 0;
    margin: auto; */
    margin-top: 300px;
    border: 1px gray solid;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

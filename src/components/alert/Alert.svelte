<script lang="ts">
  import { fly } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import { alertStore } from '../../stores/alertHandler'

  $: alerts = $alertStore.filter((v) => v.active).reverse()

  $: spacing = alerts.length
</script>

<div class="alertBoxWrapper">
  {#each alerts as alert, i}
    <div
      in:fly={{ duration: 350, y: 300 }}
      class="alertBox"
      style="z-index: {100 + i}; bottom: {spacing / ((i === 0 ? 1 : i + spacing / 50) * 0.1) + 'px'}; --theme-color: {alertColors[alert.severity]}"
    >
      <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => (alert.active = false)}>x</button>
      <p><b>{alert.severity.toUpperCase()}</b></p>
      <p>{alert.text}</p>
    </div>
  {/each}
</div>

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
    transition: bottom 250ms ease-in-out;
    /* inset: 0;
    margin: auto; */
    margin-top: 300px;
    border: 1px gray solid;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

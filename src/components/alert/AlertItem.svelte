<script lang="ts">
  import { fly } from 'svelte/transition'
  import { alertStore } from '../../stores/alertHandler'
  import { alertColors } from '../../style/defaultColors'
  import type { AlertType } from './AlertType'
  import { onMount } from 'svelte'

  export let alert: AlertType
  export let index: number

  $: bottomPx = `${index}px`
</script>

<div in:fly={{ duration: 500, y: 300 }} class="alertBox" style="--bottomPx: {bottomPx}; z-index: {10 + index}; --theme-color: {alertColors[alert.severity]}">
  <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => (alert.active = false)}>x</button>
  <p><b>{alert.severity.toUpperCase()}</b></p>
  <p>{alert.text}</p>
</div>

<style>
  .alertBox {
    position: absolute;
    background-color: var(--theme-color);
    color: #000;
    padding: 1em;
    min-width: 300px;
    max-width: 30%;
    height: fit-content;
    font-size: 12px;
    border-radius: 0.8em;
    right: 10px;
    bottom: var(--bottomPx);
    border: 1px solid gray;
    transition: all 500ms;
    opacity: 1;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

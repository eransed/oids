<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { alertStore } from '../../stores/alertHandler'
  import { alertColors } from '../../style/defaultColors'
  import type { AlertType } from './AlertType'

  export let alert: AlertType

  export let scaleSize: number
  export let spacing: number
  export let isHovered: boolean

  export let clickCloseCallback: () => void
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  in:fly={{ duration: 350, y: 300 }}
  out:fade={{ duration: 150 }}
  class:hovering={isHovered}
  class="alertBox"
  style="position: {isHovered ? 'relative' : 'absolute'}; --scaleSize: {isHovered ? 1 : scaleSize}; --spacing: {isHovered ? 0 : spacing}px;  --theme-color: {alertColors[alert.severity]}"
>
  <button style="position: absolute; right: 0; padding: 0.4em; margin: 0.2em; top: 0" on:click={() => clickCloseCallback()}>x</button>
  <p><b>{alert.severity.toUpperCase()}</b></p>
  <p>{alert.text}</p>
</div>

<style>
  .alertBox {
    transform: scale(var(--scaleSize));
    bottom: var(--spacing);
    position: absolute;
    background-color: var(--theme-color);
    color: #000;
    padding: 1em;
    min-width: 300px;
    width: -moz-fit-content;
    width: fit-content;
    max-width: 30%;
    height: 50px;
    font-size: 12px;
    border-radius: 0.8em;
    z-index: 4;
    opacity: 1;
    right: 5px;
    border: 1px gray solid;
    transition: all 500ms ease;
    margin-top: 0.2em;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

<script lang="ts">
  import type { Button90Config } from '../../interfaces/menu'
  import CircularSpinner from '../loaders/circularSpinner.svelte'

  export let mouseTracking: boolean = false
  export let selected: boolean = false
  export let loading: boolean = false
  export let disabled: boolean = loading

  export let buttonConfig: Button90Config = {
    buttonText: '',
    clickCallback: () => {
      console.error('Callback not implemented')
    },
    selected: false,
  }

  $: m = { x: '', y: '' }

  function handleMousemove(event: MouseEvent) {
    if (mouseTracking) {
      m.x = event.offsetX + 'px'
      m.y = event.offsetY + 'px'
    }
  }

  const handleMouseLeave = (event: MouseEvent) => {
    if (mouseTracking) {
      m.x = '0px'
      m.y = '0px'
    }
  }
</script>

<div on:mousemove={handleMousemove} on:mouseleave={handleMouseLeave}>
  <button
    {disabled}
    style="--left: {m.x}; --top: {m.y}"
    class={buttonConfig.selected || selected ? 'selected' : 'notSelected'}
    on:click={buttonConfig.clickCallback}
  >
    {#if loading}
      <CircularSpinner />
    {:else}
      {buttonConfig.buttonText}
    {/if}
  </button>
</div>

<style>
  :root {
    --left: 100px;
    --top: 100px;
  }

  button {
    min-width: 10em;
    background: var(--main-card-color);
    color: var(--main-text-color);
    padding: 10px;
    width: fit-content;
    height: 4em;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    font-weight: bold;
    font-size: 15px;
    letter-spacing: calc(var(--top) * 1.05 - var(--top));
    text-transform: uppercase;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
    /* border: 2px solid rgb(47, 167, 252, 0.5); */

    /* transition-duration: 1.8s; */
  }

  button:hover {
    border-color: var(--main-text-color);
    border-bottom: 1px solid;
    /* background: rgb(0, 0, 0);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.7375565610859729) 0%, rgba(6, 122, 201, 1) 86%, rgba(255, 255, 255, 0.4660633484162896) 100%); */
    transition: all;
    transition-duration: 0s;
    color: var(--main-text-color);
  }

  .notSelected {
    border: none;
    opacity: 1;
    color: var(--main-text-color);
    /* transition-property: all; */
    /* transition-duration: 0.5s; */
    background: none;
  }
  .selected {
    border: none;
    background-color: transparent;
    /* border-color: rgb(161, 211, 247, 1); */
    border-bottom: 1px solid;
    border-color: var(--main-text-color);
    color: var(--main-text-color);
    opacity: 1;
    /* transition-property: all; */
    /* transition-duration: 0.5s; */
    /* background: rgb(0, 0, 0); */
    /* background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(6, 122, 201, 1) 86%, rgba(255, 255, 255, 0.4660633484162896) 100%); */
  }

  button:disabled {
    cursor: default;
  }

  button:disabled:hover {
    cursor: default;
    border: 2px solid rgb(47, 167, 252, 0.5);
    background: transparent;
  }
</style>

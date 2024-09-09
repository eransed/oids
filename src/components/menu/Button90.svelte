<script lang="ts">
  import type { Button90Config } from '../../lib/interface'

  import CircularSpinner from '../loaders/circularSpinner.svelte'

  // export let border: boolean = false
  export let addInfo: string = ''
  export let minWidth: string = '10em'
  export let width: string = ''
  export let borderBottom: boolean = false
  export let mouseTracking: boolean = false
  export let selected: boolean = false
  export let loading: boolean = false
  export let disabled: boolean = loading
  export let icon: string = ''
  export let socialIcon: string = ''
  export let buttonType: 'submit' | 'button' | 'reset' = 'button'
  export let buttonConfig: Button90Config = {
    buttonText: '',
    clickCallback: () => {
      // console.error('Callback not implemented')
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

  $: border = borderBottom ? '1px solid var(--main-accent-color)' : 'none'
  $: minWidth = minWidth
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" on:mousemove={handleMousemove} on:mouseleave={handleMouseLeave}>
  <button
    type={buttonType}
    title={buttonConfig.buttonText}
    {disabled}
    style="width: {width}; min-Width: {minWidth}; --left: {m.x}; --top: {m.y}; border: {border}; border-radius: 0.8em"
    class={buttonConfig.selected || selected ? 'selected' : 'notSelected'}
    on:click={buttonConfig.clickCallback}
  >
    {#if loading}
      <CircularSpinner />
    {:else if icon}
      <div class="icon">
        <img draggable="false" src={icon} alt={icon} />
      </div>
    {:else if socialIcon}
      <div class="socialIcon">
        <img draggable="false" src={socialIcon} alt={socialIcon} />
      </div>
    {:else}
      {buttonConfig.buttonText}
    {/if}
    <p class="addInfo">{addInfo}</p>
  </button>
</div>

<style>
  :root {
    --left: 100px;
    --top: 100px;
  }

  .addInfo {
    font-size: 0.7em;
    position: absolute;
    /* display: flex; */
    bottom: 0;
    margin-bottom: -1.3em;
  }

  .icon img {
    filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg) brightness(83%) contrast(30%);
    width: 35px;
    height: 35px;
  }

  .socialIcon img {
    /* filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg)
      brightness(83%) contrast(30%); */
    width: 35px;
    height: 35px;
  }

  .wrapper {
    text-align: center;
    display: flex;
    justify-content: center;
    min-width: 0px;
    position: relative;
    /* align-content: center; */
  }

  button {
    justify-content: center;
    align-content: center;
    display: flex;
    min-width: 10em;
    background: var(--main-card-color);
    color: var(--main-text-color);
    padding: 10px;
    width: -moz-fit-content;
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
    position: relative;
    /* border: 2px solid rgb(47, 167, 252, 0.5); */

    /* transition-duration: 1.8s; */
  }

  button:hover img {
    filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg) brightness(83%) contrast(125%);
    transform: scale(1.1);
    transition: all 0.3s ease-out;
  }

  button:hover {
    transform: scale(1.1);
    transition: all 0.3s ease-out;
  }

  button {
    transition: all 0.3s;
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
    border-color: var(--main-text-color);
    color: var(--main-text-color);
    opacity: 1;

    /* transition-property: all; */
    /* transition-duration: 0.5s; */
    /* background: rgb(0, 0, 0); */
    /* background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(6, 122, 201, 1) 86%, rgba(255, 255, 255, 0.4660633484162896) 100%); */
  }

  .selected img {
    filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg) brightness(83%) contrast(125%);
  }

  button:disabled {
    cursor: not-allowed;
    filter: invert(100%) sepia(15%) saturate(6959%) hue-rotate(307deg) brightness(83%) contrast(1%);
  }
</style>

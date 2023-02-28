<script lang="ts">
  import type { Button90Config } from "../../interface"

  //Name explained: Tribute to 90's game button styles

  export let buttonConfig: Button90Config = {
    buttonText: "",
    clickCallback: () => {
      console.error("Callback not implemented")
    },
    selected: false,
  }

  $: m = { x: "", y: "" }

  function handleMousemove(event: MouseEvent) {
    m.x = event.offsetX + "px"
    m.y = event.offsetY + "px"
  }
</script>

<style>
  :root {
    --left: 100px;
    --top: 100px;
  }

  button {
    color: #fff;
    /* border: solid; */
    padding: 10px;
    width: 100%;
    /* margin: 5px; */

    height: 45px;
    /* font-family: 'Courier New', Courier, monospace; */
    /* font-family: 'Times New Roman', Times, serif; */
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-weight: bold;
    font-size: 15px;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(161, 211, 247, 0.5);
    letter-spacing: calc(var(--top) * 1.05 - var(--top));
    text-transform: uppercase;
    cursor: pointer;
    font-size: 12px;
    font: menu;
  }

  button:hover {
    border-color: rgb(161, 211, 247, 1);
    background: rgb(0, 0, 0);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.7375565610859729) 0%,
      rgba(6, 122, 201, 1) 86%,
      rgba(255, 255, 255, 0.4660633484162896) 100%
    );
    transition-property: all;
    transition-duration: 1s;
  }

  .notSelected {
    background-color: transparent;
    opacity: 1;
    transition-property: all;
    transition-duration: 0.5s;
    background: radial-gradient(
      800px circle at var(--left) var(--top),
      rgba(255, 255, 255, 0.06),
      transparent 100%
    );
  }
  .selected {
    background-color: transparent;
    border-color: rgb(161, 211, 247, 1);
    opacity: 1;
    transition-property: all;
    transition-duration: 0.5s;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.7375565610859729) 0%,
      rgba(6, 122, 201, 1) 86%,
      rgba(255, 255, 255, 0.4660633484162896) 100%
    );
  }

  .buttonWrapper {
    border: 2px solid rgb(47, 167, 252, 0.5);
    border-radius: 8px;
  }
</style>

<div on:mousemove={handleMousemove} class="buttonWrapper">
  {#if buttonConfig.selected}
    <button
      style="--left: {m.x}; --top: {m.y}"
      class="selected"
      on:click={buttonConfig.clickCallback}>{buttonConfig.buttonText}</button
    >
  {:else}
    <button
      style="--left: {m.x}; --top: {m.y}"
      class="notSelected"
      on:click={buttonConfig.clickCallback}
      >{buttonConfig.buttonText}
    </button>
  {/if}
</div>

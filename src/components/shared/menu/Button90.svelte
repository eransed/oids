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
    --left: 0;
    --top: 0;
  }

  button {
    /* border: solid; */
    padding: 15px;
    /* margin: 5px; */
    min-width: 180px;
    height: 60px;
    /* font-family: 'Courier New', Courier, monospace; */
    /* font-family: 'Times New Roman', Times, serif; */
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-weight: bold;
    font-size: 15px;
    border-radius: 8px;
    border-width: 0px;
  }

  button.notSelected:hover {
    cursor: pointer;
    color: #000;
    background: radial-gradient(
      800px circle at var(--left) var(--top),
      rgba(255, 255, 255, 0.7),
      transparent 40%
    );
    transition-property: all;
    transition-duration: 1s;
    letter-spacing: 1px;
  }

  .notSelected {
    background-color: transparent;
    color: #fff;
    opacity: 0.85;
    transition-property: all;
    transition-duration: 0.5s;
    background: radial-gradient(
      800px circle at var(--left) var(--top),
      rgba(255, 255, 255, 0.06),
      transparent 40%
    );
  }
  .selected {
    background-color: transparent;
    color: #000;
    opacity: 0.85;
    transition-property: all;
    transition-duration: 0.5s;
    background: radial-gradient(
      800px circle at var(--left) var(--top),
      rgba(255, 255, 255, 1),
      transparent 40%
    );
  }
</style>

<div on:mousemove={handleMousemove}>
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

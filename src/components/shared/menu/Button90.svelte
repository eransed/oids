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
    m.x = event.pageX + "px"
    m.y = event.pageY + "px"
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
    transition-property: all;
    transition-duration: 1s;
  }

  button:hover {
    transition-property: all;
    transition-duration: 1s;
    cursor: pointer;
  }

  .notSelected {
    background-color: transparent;
    color: #fff;
    opacity: 0.85;
  }
  .selected {
    background-color: #fff;
    color: #000;
    font-weight: bold;
    font-size: 17px;
    font-stretch: expanded;

    /* border: solid; */
    /* border-color: #ccc; */
  }
  .beam {
    position: fixed;
    box-shadow: 1px 1px 100px 50px rgb(132, 210, 241);

    border-radius: 100%;
    z-index: -1;
    display: block;
    content: "";
    height: 0px;
    width: 0px;
    max-width: 100%;
    left: var(--left);
    top: var(--top);
    opacity: 0;
    transition-property: opacity;
    transition-delay: 0s;
    transition-duration: 1.5s;
    overflow: hidden;
  }

  .notSelected:hover .beam {
    opacity: 1;
    transition-property: opacity;
    transition-delay: 0s;
    transition-duration: 1s;
  }

  .notSelected:hover {
    color: #000;
  }
</style>

<div>
  {#if buttonConfig.selected}
    <button class="selected" on:click={buttonConfig.clickCallback}
      >{buttonConfig.buttonText}</button
    >
  {:else}
    <button
      class="notSelected"
      on:click={buttonConfig.clickCallback}
      on:mousemove={handleMousemove}
      >{buttonConfig.buttonText}
      <div class="beam" style="--left: {m.x}; --top: {m.y}" /></button
    >
  {/if}
</div>

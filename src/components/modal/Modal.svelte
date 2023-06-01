<script lang="ts">
  type positionType = "fixed" | "absolute" | "relative"

  export let title: string = "Title"
  export let closeBtn: boolean = true
  export let showModal: boolean = true
  export let isEditable: boolean = false
  export let closedCallback: () => void = () => {}
  export let backDrop: boolean = true
  export let position: positionType = "fixed"

  import { fade } from "svelte/transition"

  $: width = backDrop ? "100%" : "fit-content"
  $: height = backDrop ? "100vh" : "fit-content"
  $: position = position

  function handleClick() {
    showModal = false
    closedCallback()
  }

  const modalExplain = "This will be deleted if you give the <Modal> component any children </Modal>"

  $: m = { x: "", y: "" }

  function handleMousemove(event: MouseEvent) {
    m.x = event.offsetX + "px"
    m.y = event.offsetY + "px"
  }
</script>

<style>
  :root {
    --width: "";
    --height: "";
    --left: 0;
    --top: 0;
  }

  #modal {
    position: fixed;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    width: var(--width);
    height: var(--height);
    z-index: 2;
    color: #fff;
    top: 0.2em;
    right: 0.2em;
    transition: all;
    transition-duration: 1s;
    background: #000;
    opacity: 0.95;
    border: 2px solid rgb(99, 136, 179, 1);
    border-radius: 4px;
    outline: 2px solid rgb(36, 22, 159);
  }

  #modalContent {
    width: 100%;
    min-width: 200px;
    min-height: 200px;
    background: radial-gradient(800px circle at 100px 100px, rgba(255, 255, 255, 0.05), transparent 40%);
    opacity: 0.85;
    padding: 1em;
    transition: all;
    transition-duration: 1s;
  }

  @media screen and (max-width: 600px) {
    #modal {
      opacity: 1;
      width: 100vw;
      height: 100vh;
      background: #000;
      top: 0em;
      right: 0em;
      z-index: 1;
      justify-content: center;
      align-content: center;
      flex-wrap: wrap;
    }
    #modalContent {
      opacity: 1;
      width: 50%;
      height: 98vh;
      background: #000;
      background-image: "";
      justify-content: center;
      align-content: center;
      flex-wrap: wrap;
      display: flex;
    }
  }

  #header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-wrap: wrap;
    top: 0;
    width: 100%;
    height: 10%;
    min-height: 35px;
    background: transparent;
  }

  #headerTitle {
    padding: 0.5em;
  }

  #closeBtn {
    opacity: 0.5;
    cursor: pointer;
    position: absolute;
    right: 1px;
    top: 1px;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    border-color: rgb(47, 167, 252, 1);
    border-style: ridge;
    border-width: 0.15em;
    background-color: #000;
    transition: all;
    transition-duration: 1s;
    transition-timing-function: cubic-bezier(1, -2, 0.26, 1.1);
  }

  #closeBtn::before,
  #closeBtn::after {
    content: "";
    position: absolute;
    background-color: #fff;
    left: 50%;
    width: 10%;
    margin-left: -4%;
    margin-top: 22%;
    height: 60%;
    border-radius: 5px;
  }

  #closeBtn::before {
    transform: rotate(45deg);
  }

  #closeBtn::after {
    transform: rotate(-45deg);
  }

  #closeBtn:hover {
    transform: rotate(90deg);
    transition: transform opacity;
    transition-timing-function: cubic-bezier(1, -1.53, 0.26, 1.1);
    transition-duration: 1s;
    opacity: 1;
    border-color: rgb(47, 167, 252, 1);
  }
</style>

{#if showModal}
  <div
    id="modal"
    style="--width: {width}; --height: {height}; position: {position}"
    contenteditable={isEditable}
    in:fade={{ delay: 50 }}
    out:fade
    on:mousemove={handleMousemove}
  >
    <div id="modalContent" style="--left: {m.x}; --top: {m.y};">
      <div id="header">
        <div id="headerTitle"><h3>{title}</h3></div>

        {#if closeBtn}<div on:click={() => handleClick()} on:keydown={() => {}} id="closeBtn" />{/if}
      </div>

      <slot><p>{modalExplain}</p></slot>
    </div>
  </div>
{/if}

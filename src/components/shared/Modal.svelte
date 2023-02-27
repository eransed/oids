<script lang="ts">
  export let title: string = "Title"
  export let closeBtn: boolean = true
  export let showModal: boolean = true
  export let isEditable: boolean = false
  export let closedCallback: () => void = () => {}
  export let backDrop: boolean = true

  import { fade } from "svelte/transition"

  $: display = showModal ? "flex" : "none"
  $: width = backDrop ? "100%" : "fit-content"
  $: height = backDrop ? "100vh" : "fit-content"

  function handleClick() {
    showModal = false
    closedCallback()
  }

  const modalExplain =
    "This will be deleted if you give the <Modal> component any children </Modal>"

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
    z-index: 1;
    color: #fff;
    top: 0.2em;
    right: 0.2em;
    transition: all;
    transition-duration: 1s;
    background: #000;
    opacity: 0.95;
  }

  #modalContent:hover {
    background: radial-gradient(
      800px circle at var(--left) var(--top),
      rgba(255, 255, 255, 0.1),
      transparent 40%
    );
    transition: all;
    transition-duration: 1s;
  }

  #modalContent {
    width: 15%;
    min-width: 200px;
    min-height: 200px;
    background: radial-gradient(
      800px circle at 100px 100px,
      rgba(255, 255, 255, 0.05),
      transparent 40%
    );
    opacity: 0.85;
    padding: 0.2em;
    transition: all;
    transition-duration: 1s;
  }

  @media screen and (max-width: 600px) {
    #modal {
      width: 100%;
      height: 100%;
      background-color: #000;
      top: 0em;
      right: 0em;
    }
    #modalContent {
      width: 90vw;
      height: 70vh;
      background-color: #000;
      background-image: "";
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
    height: 20%;
    min-height: 35px;
    background: transparent;
    border-bottom-width: 0.2em;
    border-bottom-style: solid;
    border-bottom-color: rgb(105, 105, 105);
  }

  #headerTitle {
    padding: 0.5em;
  }

  #closeBtn {
    cursor: pointer;
    position: absolute;
    right: 1px;
    top: 1px;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    border-color: #000;
    border-style: solid;
    border-width: 0.2em;
    background-color: #000;
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
    transform: rotate(10deg);
  }
</style>

<div
  id="modal"
  style="  display:  {display}; --width: {width}; --height: {height}"
  contenteditable={isEditable}
  in:fade={{ delay: 50 }}
  out:fade
  on:mousemove={handleMousemove}
>
  <div id="modalContent" style="--left: {m.x}; --top: {m.y};">
    <div id="header">
      <div id="headerTitle"><h3>{title}</h3></div>

      {#if closeBtn}<div
          on:click={() => handleClick()}
          on:keydown={() => {}}
          id="closeBtn"
        />{/if}
    </div>

    <slot><p>{modalExplain}</p></slot>
  </div>
</div>

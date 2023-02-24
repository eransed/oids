<script lang="ts">
  export let title: string = "Title"
  export let closeBtn: boolean = true
  export let showModal: boolean = true
  export let isEditable: boolean = false
  export let closedCallback: () => void = () => {}
  export let backDrop: boolean = true

  $: display = showModal ? "flex" : "none"
  $: width = backDrop ? "100%" : "fit-content"
  $: height = backDrop ? "100vh" : "fit-content"

  function handleClick() {
    showModal = false
    closedCallback()
  }

  const modalExplain =
    "This will be deleted if you give the <Modal> component any children </Modal>"
</script>

<style>
  :root {
    --width: "";
    --height: "";
  }

  #modal {
    background-color: rgb(0, 0, 0, 0.7);
    position: fixed;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    width: var(--width);
    height: var(--height);
    z-index: 1;
    color: #000;
    top: 0.2em;
    right: 0.2em;
  }

  #modalContent {
    width: 15%;
    min-width: 200px;
    min-height: 200px;
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(160deg, #ffffff 0%, #d6e8e5 100%);
    opacity: 0.85;
    padding: 0.2em;
    border-radius: 8px;
  }

  @media screen and (max-width: 600px) {
    #modal {
      background-color: #fff;
      width: 100%;
      height: 100%;
      background-color: rgb(255, 255, 255);
      background-image: linear-gradient(160deg, #ffffff 0%, #d6e8e5 100%);
      top: 0em;
      right: 0em;
    }
    #modalContent {
      width: 90vw;
      height: 70vh;
      background-color: #fff;
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
  style="display: {display}; --width: {width}; --height: {height}"
  contenteditable={isEditable}
>
  <div id="modalContent">
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

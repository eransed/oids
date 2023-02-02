<script lang="ts">
  export let title: string = "Example";
  export let closeBtn: boolean = true;
  export let showModal: boolean = true;
  export let isEditable: boolean = false;

  $: display = showModal ? "flex" : "none";

  function handleClick() {
    showModal = false;
  }

  const modalExlain =
    "This will be deleted if you give the <Modal> component any children </Modal>";
</script>

<style>
  #modal {
    background-color: rgb(0, 0, 0, 0.7);
    position: fixed;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    width: 100%;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 1;
    color: #000;
  }

  #modalContent {
    width: 15%;
    min-width: 200px;
    min-height: 200px;
    background-color: #fff;
    padding: 0.2em;
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

<div id="modal" style:display contenteditable={isEditable}>
  <div id="modalContent">
    <div id="header">
      <div id="headerTitle"><h3>{title}</h3></div>

      {#if closeBtn}<div
          on:click|once={() => handleClick()}
          on:keydown={() => {}}
          id="closeBtn"
        />{/if}
    </div>
    <slot><p>{modalExlain}</p></slot>
  </div>
</div>

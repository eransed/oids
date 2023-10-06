<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  //Icons
  import { Icons } from '../../style/icons'

  //Components
  import Button90 from '../menu/Button90.svelte'

  //Props
  export let closeBtn = () => {}
  export let saveBtn = async () => {}
  export let disabled: boolean = false
  export let title: string = ''

  let dialog: HTMLDialogElement

  onMount(() => {
    console.log('showModal')
    dialog.showModal()

    dialog.addEventListener('keydown', (e: KeyboardEvent) => onEsc(e))
  })

  function onEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeBtn()
    }
  }
</script>

<dialog id="dialogen" bind:this={dialog}>
  <h3 style="color: var(--main-text-color); position: absolute">{title}</h3>
  <div class="dialogWrapper">
    <slot />

    <div class="dialogButtons">
      <Button90
        minWidth={'0px'}
        width={'45%'}
        {disabled}
        icon={Icons.Cancel}
        mouseTracking={false}
        buttonConfig={{
          buttonText: 'Close',
          clickCallback: async () => {
            dialog.close()
            closeBtn()
          },
          selected: false,
        }}
      />

      <Button90
        minWidth={'0px'}
        width={'45%'}
        {disabled}
        icon={Icons.Save}
        mouseTracking={false}
        buttonConfig={{
          buttonText: 'Save',
          clickCallback: async () => {
            await saveBtn()
          },
          selected: false,
        }}
      />
    </div>
  </div>
</dialog>

<style>
  dialog {
    padding: 2em;
    width: 50%;
    /* min-width: 500px; */
    max-width: 1200px;
    background: var(--main-card-color);
    border: none;
    border-radius: 1em;
    margin: auto;
    z-index: 2;
    text-align: center;
    display: flex;
    justify-content: center;
    animation: show 1s ease-in-out forwards;
  }

  dialog::backdrop {
    opacity: 0;
    animation: backdrop 300ms ease-in-out forwards;
    animation-delay: 500ms;
    background: rgba(210, 180, 140, 0.2);
  }

  @keyframes show {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes backdrop {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .dialogWrapper {
    padding: 2em;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    width: 100%;
    /* background: var(--main-card-color); */
    border: none;
    border-radius: 1em;
  }

  .dialogButtons {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: none;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-end;
  }

  @media screen and (max-width: 1300px) {
    dialog {
      width: 40%;
    }
  }

  @media screen and (max-width: 750px) {
    dialog {
      width: 100%;
      z-index: 3;
    }
  }

  @media screen and (max-width: 750px) and (min-width: 100px) {
    dialog {
      width: 100%;
      z-index: 3;
    }
  }
</style>

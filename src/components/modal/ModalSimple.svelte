<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  //Icons
  import { Icons } from '../../style/icons'

  //Components
  import Button90 from '../menu/Button90.svelte'
  import Cursor from '../mouse/cursor.svelte'

  interface Step {
    //Desc = description
    desc: string
    completed: boolean
  }

  //Props
  export let closeBtn = () => {}
  export let saveBtn = async () => {}
  export let disabled: boolean = false
  export let title: string = ''
  export let steps: Step[] = []
  export let doneCallback: () => void = () => {}

  /**
   *
   * @description If you want the modal to have a save button
   */
  export let saveButton: boolean = true

  /**
   *
   * @description If you want the modal to have a cancel button
   */
  export let cancelButton: boolean = true

  $: if (steps) {
    checkProgress()
  }

  let dialog: HTMLDialogElement
  $: stepProgress = 0

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

  function checkProgress() {
    stepProgress = steps.filter((step) => {
      if (step.completed) {
        return step
      }
    }).length

    if (stepProgress === steps.length) {
      doneCallback()
    }
  }
</script>

<dialog bind:this={dialog}>
  <h3 style="color: var(--main-text-color); position: absolute">{title}</h3>
  <div class="dialogWrapper">
    <slot />

    <div class="dialogButtons">
      {#if steps.length > 0}
        <ol style="text-align: left;">
          <p>
            Done: {stepProgress}/{steps.length}
          </p>

          {#each steps as step}
            <li style="color: {step.completed ? 'var(--main-accent2-color)' : ''}">{step.desc}</li>
          {/each}
        </ol>
        <br />
      {/if}
      {#if cancelButton}
        <Button90
          minWidth={'0px'}
          width={'45%'}
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
      {/if}
      {#if saveButton}
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
      {/if}
    </div>
  </div>
</dialog>

<style>
  dialog {
    padding: 2em;
    width: 30%;
    /* height: 90vh; */
    max-height: 80vh;
    /* min-width: 500px; */
    max-width: 1200px;
    background: var(--main-card-color);
    border: none;
    border-radius: 1em;
    margin: auto;
    z-index: 2;
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    animation: show 1s ease-in-out forwards;
    color: var(--main-text-color);
    align-content: flex-start;

    z-index: 0;
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
    width: 80%;
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
      width: 50%;
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

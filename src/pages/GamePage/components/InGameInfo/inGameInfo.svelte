<script lang="ts">
  //Svelte
  import { fly, slide } from 'svelte/transition'

  //Component
  import Modal from '../../../../components/modal/Modal.svelte'

  //Propts
  export let closedCallback: () => void = () => {}
  export let showModal: boolean
  export let title: string
</script>

<div out:slide>
  <Modal position="relative" {title} {showModal} {closedCallback} backDrop={false} closeBtn={true}>
    <slot />
  </Modal>
</div>

<style>
  div {
    z-index: 10;
    animation: easeIn ease-in-out;
    animation-duration: 250ms;
  }
  @keyframes easeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>

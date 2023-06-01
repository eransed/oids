<script lang="ts">
  //Svelte
  import { slide } from "svelte/transition"

  //Component
  import Modal from "../modal/Modal.svelte"

  //Propts
  export let closedCallback: () => void
  export let showModal: boolean
  export let title: string
</script>

<style>
</style>

<Modal position="relative" {title} {showModal} {closedCallback} backDrop={false} closeBtn={false}>
  <div in:slide={{ duration: 500 }} out:slide>
    <slot />
  </div>
</Modal>

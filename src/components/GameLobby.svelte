<script lang="ts">
  import { showLobby } from "../lib/stores"
  import Modal from "./shared/Modal.svelte"

  let showGameLobby = false

  showLobby.subscribe((showLobbyValue: boolean) => {
    showGameLobby = showLobbyValue
  })
</script>

<style>
</style>

<Modal showModal={showGameLobby} closedCallback={() => showLobby.set(false)}
  >GameLobby</Modal
>

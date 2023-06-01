<script lang="ts">
  import Modal from "../modal/Modal.svelte"
  import type { ScoreScreenData } from "./ScoreScreen.types"

  export let ScoreScreenData: ScoreScreenData
  export let closedCallback: () => void
  export let showModal: boolean
</script>

<style>
</style>

<Modal title={"Score screen"} {showModal} {closedCallback} backDrop={false} closeBtn={false}>
  {#each ScoreScreenData.players as player}
    <table>
      <row>
        <cell>{player.name.toLocaleUpperCase()}</cell>
        <cell>{player.alive ? "Alive" : "Dead"}</cell>
      </row>
    </table>
  {/each}
</Modal>

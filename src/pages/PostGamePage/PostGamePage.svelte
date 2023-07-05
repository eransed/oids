<script lang="ts">
  // Svelte
  import { fade } from "svelte/transition"

  // Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  // Stores
  import { pageHasHeader, user } from "../../stores/stores"

  // Interface
  import type { User } from "../../interfaces/user"

  // Utils
  import { rndi } from "mathil"

  pageHasHeader.set(true)

  let userData: User | undefined

  user.subscribe((value) => {
    userData = value
  })

  let userName = userData ? userData?.name : `Player ${rndi(1, 100)}`

  let typeWriterMessage = `${userName} you died!`
</script>

<div class="postGamePage" in:fade={{ delay: 300 }} out:fade>
  <TypeWriter text={typeWriterMessage} speed={50} humanRandomeness />
</div>

<style>
  .postGamePage {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    height: 100vh;
    width: 100vw;
  }
</style>

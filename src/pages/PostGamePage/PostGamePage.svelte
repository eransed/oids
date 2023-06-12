<script lang="ts">
  // Svelte
  import { fade } from "svelte/transition"

  // Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"
  import SunRise from "../../components/sunRise/SunRise.svelte"

  // Stores
  import { pageHasHeader, user } from "../../stores/stores"

  // Interface
  import type { User } from "../../interfaces/user"

  // Utils
  import { rndi } from "../../lib/math"

  pageHasHeader.set(true)

  let userData: User | undefined

  user.subscribe((value) => {
    userData = value
  })

  let userName = userData ? userData?.name : `Player ${rndi(1, 100)}`

  let typeWriterMessage = `This is Echo-9, calling out to ${userName}! Regardless of the outcome, here's a glimmer of hope for you, ${userName}. Witness the majestic sunrise painting the horizon in hues of gold and warmth. It's a symbol of resilience and new beginnings. Ready? 3... 2... 1...`

  let makeItShine = false
</script>

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

{#if makeItShine}
  <SunRise />
{/if}
<div class="postGamePage" in:fade={{ delay: 300 }} out:fade>
  <TypeWriter text={typeWriterMessage} doneCallback={() => (makeItShine = true)} speed={50} humanRandomeness />
</div>

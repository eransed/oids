<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"

  //Stores
  import { pageHasHeader, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  pageHasHeader.set(true)

  let userData: User | undefined

  user.subscribe((v) => {
    userData = v
  })

  let pageMessage = `This is the Profile page!`
</script>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    height: 100vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
  }
</style>

<div class="wrapper" in:fade={{ delay: 300 }} out:fade>
  <TypeWriter text={pageMessage} />
</div>

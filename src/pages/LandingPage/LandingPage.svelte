<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"

  //Stores
  import { pageHasHeader, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Utils
  import { rndi } from "../../lib/math"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  pageHasHeader.set(true)

  let userData: User | undefined

  user.subscribe((value) => {
    userData = value
  })

  let userName = userData ? userData?.name : `Player ${rndi(1, 100)}`

  let welcomeMessage = `Welcome to OIDS ${userName}`
</script>

<style>
  .landingPage {
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

<div out:fade class="landingPage">
  <TypeWriter text={welcomeMessage} />
</div>

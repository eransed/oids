<script lang="ts">
  //Svelte
  import { fade } from "svelte/transition"

  //Stores
  import { guestUserName, pageHasHeader, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Utils
  import { rndi } from "mathil"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  pageHasHeader.set(true)

  let welcomeMessage = `Welcome to OIDS ${$user ? $user?.name : $guestUserName}`
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
  }
</style>

<div out:fade class="landingPage">
  <TypeWriter text={welcomeMessage} />
</div>

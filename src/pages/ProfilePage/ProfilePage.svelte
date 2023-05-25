<script lang="ts">
  //Svelte
  import { onMount } from "svelte"

  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  //Stores
  import { currentLocation, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Location update
  currentLocation.set("/profile")

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

<div class="wrapper">
  <TypeWriter text={pageMessage} />
</div>

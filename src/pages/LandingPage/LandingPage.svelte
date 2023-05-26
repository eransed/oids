<script lang="ts">
  //Svelte

  //Stores
  import { currentLocation, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Utils
  import { rndi } from "../../lib/math"

  //component
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"
  import SunRise from "../../components/sunRise/SunRise.svelte"
  import { fade } from "svelte/transition"

  //Location update
  currentLocation.set("/")

  let userData: User | undefined

  user.subscribe((value) => {
    userData = value
  })

  let userName = userData ? userData?.name : `Player ${rndi(1, 100)}`

  let welcomeMessage = `Welcome to OIDS ${userName}`
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

<div out:fade class="wrapper">
  <TypeWriter text={welcomeMessage} />
</div>

<script lang="ts">
  //Components
  import TypeWriter from "../../components/typeWriter/TypeWriter.svelte"

  //Stores
  import { currentLocation, gameSessionId, user } from "../../stores/stores"

  //Interface
  import type { User } from "../../interfaces/user"

  //utils
  import { rndi } from "../../lib/math"

  //Location update
  currentLocation.set("/play/game/end")

  let userData: User | undefined

  user.subscribe((value) => {
    userData = value
  })

  let userName = userData ? userData?.name : `Player ${rndi(1, 100)}`

  let typeWriterMessage = `Did you win ${userName}?`
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
  <TypeWriter text={typeWriterMessage} />
</div>

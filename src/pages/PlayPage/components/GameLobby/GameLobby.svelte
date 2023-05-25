<script lang="ts">
  import { currentLocation, gameSessionId, showLobby, showMenu } from "../../../../stores/stores"
  import type { Button90Config } from "../../../../interfaces/menu"
  import type { User } from "../../../../interfaces/user"
  import Button90 from "../../../../components/menu/Button90.svelte"
  import MenuWrapper from "../../../../components/menu/MenuWrapper.svelte"
  import { connectToLobbys } from "../../../../lib/services/auth/lobby"
  import { user } from "../../../../stores/stores"
  import { navigate } from "svelte-routing"

  let lobbyStep = 0

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })

  const handleSubmit = async (e: Event) => {
    const formData = new FormData(e.target as HTMLFormElement)
    const values = Object.fromEntries(formData.entries())

    const gameCode = values.gameCode.toString()

    const gameCodeLength = gameCode.length

    if (gameCodeLength >= 4) {
      console.log(gameCode)
      gameSessionId.set(gameCode)
      showLobby.set(false)
      navigate("/play/game")
      // history.replaceState(null, "", `game?id=${gameCode}`)
    }

    // const response = await connectToLobbys(formData)

    // if (response.status === 200) {
    //   lobbyStep = 1
    // }
  }

  const submitButton: Button90Config = {
    buttonText: "Lets go!",
    clickCallback: () => handleSubmit,
    selected: false,
  }

  const readyButton: Button90Config = {
    buttonText: "I'm ready!",
    clickCallback: () => handleSubmit,
    selected: false,
  }
</script>

<style>
  form {
    padding: 1em;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  input {
    padding: 1em;
  }

  .lobbyButtons > * {
    padding: 0.5em;
  }

  .gameLobby {
    display: flex;
    justify-content: center;
  }
</style>

<div class="gameLobby">
  {#if lobbyStep === 0}
    <MenuWrapper>
      <h5>Enter game code to create or join a game</h5>
      <form on:submit|preventDefault={handleSubmit} on:formdata>
        <input placeholder="Game code" name="gameCode" type="text" minlength="4" />
        <Button90 mouseTracking={false} buttonConfig={submitButton} />
      </form>
    </MenuWrapper>
  {/if}

  {#if lobbyStep === 1}
    <MenuWrapper>
      <h5>Welcome to the Lobby</h5>

      <p>Players in lobby</p>
      <p>{userData?.name ?? "Guest"}</p>
      <div class="lobbyButtons">
        <div><Button90 mouseTracking={false} buttonConfig={readyButton} /></div>
      </div>
    </MenuWrapper>
  {/if}
</div>

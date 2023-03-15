<script lang="ts">
  import { showLobby, showMenu } from "../lib/stores"
  import type { Button90Config, User } from "./interface"
  import Button90 from "./shared/menu/Button90.svelte"
  import MenuWrapper from "./shared/MenuWrapper.svelte"
  import { connectToLobbys } from "../lib/services/auth/lobby"
  import { user } from "../lib/stores"
  import type { Game } from "../lib/game"
  import { hostname } from "../lib/constants"

  export let game: Game

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

    console.log(gameCode)

    

    if (gameCodeLength >= 4) {
      game.localPlayer.sessionId = gameCode
      await game.stopGame()
      game.startMultiplayer()
      showLobby.set(false)

      history.replaceState(null, "", `game?id=${gameCode}`)
    }

    // const response = await connectToLobbys(formData)

    // if (response.status === 200) {
    //   lobbyStep = 1
    // }
  }

  const handleExit = () => {
    showLobby.set(false)
    showMenu.set(true)
  }

  const exitButton: Button90Config = {
    buttonText: "Quit",
    clickCallback: handleExit,
    selected: false,
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
</style>

{#if lobbyStep === 0}
  <MenuWrapper>
    <h5>Enter game code to create or join a game</h5>
    <form on:submit|preventDefault={handleSubmit} on:formdata>
      <input placeholder="Game code" name="gameCode" type="text" minlength="4" />
      <Button90 mouseTracking={false} buttonConfig={submitButton} />
    </form>
    <Button90 buttonConfig={exitButton} />
  </MenuWrapper>
{/if}

{#if lobbyStep === 1}
  <MenuWrapper>
    <h5>Welcome to the Lobby</h5>

    <p>Players in lobby</p>
    <p>{userData?.name ?? "Guest"}</p>
    <div class="lobbyButtons">
      <div><Button90 mouseTracking={false} buttonConfig={readyButton} /></div>
      <div><Button90 mouseTracking={false} buttonConfig={exitButton} /></div>
    </div>
  </MenuWrapper>
{/if}

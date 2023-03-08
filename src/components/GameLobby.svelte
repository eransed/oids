<script lang="ts">
  import { showLobby, showMenu } from "../lib/stores"
  import type { Button90Config } from "./interface"
  import Button90 from "./shared/menu/Button90.svelte"
  import MenuWrapper from "./shared/MenuWrapper.svelte"
  import { removeKeyControllers } from "../lib/input"

  let showGameLobby = false

  showLobby.subscribe((showLobbyValue: boolean) => {
    showGameLobby = showLobbyValue
  })

  const handleSubmit = (e: Event) => {
    const formData = new FormData(e.target as HTMLFormElement)
    const values = Object.fromEntries(formData.entries())
    console.log(values)
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
</script>

<style>
  form {
    padding: 1em;
  }

  button {
    cursor: pointer;
    background: none;
  }
</style>

<MenuWrapper>
  <h5>Enter game code to join lobby</h5>
  <form on:submit|preventDefault={handleSubmit} on:formdata>
    <input placeholder="Game code" name="gameCode" type="text" />
    <button type="submit"
      ><Button90 mouseTracking={false} buttonConfig={submitButton} /></button
    >
  </form>
  <Button90 buttonConfig={exitButton} />
</MenuWrapper>

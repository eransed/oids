<script lang="ts">
  //Svelte
  import { navigate } from "svelte-routing"
  import { fade } from "svelte/transition"

  //Stores
  import { gameSessionId, showLobby, user } from "../../../../stores/stores"
  import { gameState } from "../../../../lib/input"

  //Interfaces
  import type { Button90Config } from "../../../../interfaces/menu"
  import type { User } from "../../../../interfaces/user"
  import type { SpaceObject } from "../../../../lib/interface"

  //Components
  import Button90 from "../../../../components/menu/Button90.svelte"
  import MenuWrapper from "../../../../components/menu/MenuWrapper.svelte"
  import ScoreScreen from "../../../GamePage/components/LeaderBoardScreen/ScoreScreen.svelte"
  import TypeWriter from "../../../../components/typeWriter/TypeWriter.svelte"

  //Services
  import { playersInSession, type Session } from "../../../../lib/services/game/playersInSession"
  import { createSpaceObject } from "../../../../lib/factory"
  import type { AxiosResponse } from "axios"

  let lobbyStep = 0
  let players: SpaceObject[]

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })

  const getPlayerList = async (sessionId: string): Promise<AxiosResponse<Session>> => {
    return await playersInSession(sessionId)
  }

  const handleSubmit = async (e: Event) => {
    const formData = new FormData(e.target as HTMLFormElement)
    const values = Object.fromEntries(formData.entries())

    const gameCode = values.gameCode.toString()

    const gameCodeLength = gameCode.length

    if (gameCodeLength >= 4) {
      const localPlayer = createSpaceObject()

      gameSessionId.set(gameCode)
      showLobby.set(false)

      const playerList = await getPlayerList(gameCode)
      if (playerList.status === 200) {
        players = playerList.data.players

        gameState.set({ scoreScreenData: { player: localPlayer, remotePlayers: players } })
        if (players.length > 0) {
          lobbyStep = 1
        } else lobbyStep = 2
      }
    }
  }

  const joinSession = () => {
    navigate(`/play/game/${$gameSessionId}`)
  }

  const submitButton: Button90Config = {
    buttonText: "Lets go!",
    clickCallback: () => handleSubmit,
    selected: false,
  }

  const readyButton: Button90Config = {
    buttonText: "I'm ready!",
    clickCallback: () => (lobbyStep = 2),
    selected: false,
  }

  const back: Button90Config = {
    buttonText: "Back",
    clickCallback: () => (lobbyStep = 0),
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
    display: grid;
    justify-content: flex-start;
    align-content: center;
    flex-wrap: wrap;
    height: fit-content;

    min-height: 300px;
    margin: 1em;
  }
</style>

<div class="gameLobby" in:fade={{ duration: 1000, delay: 300 }} out:fade>
  {#if lobbyStep === 0}
    <MenuWrapper>
      <h5>Enter game code to create or join a game</h5>

      <form on:submit|preventDefault={handleSubmit} on:formdata>
        <input placeholder="Game code" value={$gameSessionId} name="gameCode" type="text" minlength="4" />
        <Button90 mouseTracking={false} buttonConfig={submitButton} />
      </form>
    </MenuWrapper>
  {/if}

  {#if lobbyStep === 1}
    <MenuWrapper>
      <h4>Game already in progress, want to join?</h4>
      {#if players.length > 0}
        <ScoreScreen showLocalPlayer={false} />
      {/if}

      <div class="lobbyButtons">
        <div><Button90 mouseTracking={false} buttonConfig={readyButton} /></div>
        <div><Button90 mouseTracking={false} buttonConfig={back} /></div>
      </div>
    </MenuWrapper>
  {/if}

  {#if lobbyStep === 2}
    <MenuWrapper>
      <TypeWriter speed={80} text={players.length > 0 ? "Joining session..." : "Creating session..."} doneCallback={joinSession} />
    </MenuWrapper>
  {/if}
</div>

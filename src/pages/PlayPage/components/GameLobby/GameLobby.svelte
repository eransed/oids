<script lang="ts">
  //Svelte
  import { navigate } from "svelte-routing"

  //Stores
  import { gameSessionId, guestUserName, user } from "../../../../stores/stores"

  //Interfaces
  import type { Button90Config } from "../../../../interfaces/menu"
  import type { User } from "../../../../interfaces/user"
  import type { SpaceObject } from "../../../../lib/interface"

  //Components

  import Page from "../../../../components/page/page.svelte"

  //Services
  import type { Session } from "../../../../lib/interface"
  import { createSpaceObject } from "../../../../lib/factory"
  import type { AxiosResponse } from "axios"
  import { getWsUrl } from "../../../../lib/websocket/webSocket"
  import { OidsSocket } from "../../../../lib/websocket/ws"
  import { createSessionId } from "../../../../helpers/util"
  import { activeSessions } from "../../../../lib/services/game/activeSessions"
    import SessionList from "./SessionList/SessionList.svelte"
    import SessionListRow from "./SessionList/SessionListRow.svelte"

  let lobbyStep = 0
  let players: SpaceObject[]

  let userData: User | undefined

  user.subscribe((storedUser) => {
    userData = storedUser
  })


  const sock: OidsSocket = new OidsSocket(getWsUrl())
  const localPlayer = createSpaceObject($user ? $user.name : $guestUserName)

  localPlayer.sessionId = createSessionId()

  sock.send(localPlayer)

  let sessions: Session[] = []

  setTimeout( () => {

    activeSessions()
    .then((s) => {
      if (s.status === 200) {
        sessions = s.data
        // sessions.filter((sess) => {
        //   return sess.sessionHost.name !== localPlayer.name
        // })
      } else {
        console.error(`Sessions endpoint returned status ${s.status} ${s.statusText}`)
      }
    }).then(() => {
      console.log (sessions)
    })
    .catch( (e) => {
      console.error(`Failed to fetch sessions: ${e}`)
    })

  }, 200)


  /**
   * Todos:
   * Share game lobby link -> use as a param to get into lobby directly.
   */

  // const handleSubmit = async (e: Event) => {
  //   const formData = new FormData(e.target as HTMLFormElement)
  //   const values = Object.fromEntries(formData.entries())

  //   const gameCode = values.gameCode.toString()

  //   const gameCodeLength = gameCode.length

  //   if (gameCodeLength >= 4) {

  //     gameSessionId.set(gameCode)
  //     showLobby.set(false)

  //   }
  // }

  const joinSession = () => {
    navigate(`/play/multiplayer/${$gameSessionId}`)
  }

  const submitButton: Button90Config = {
    buttonText: "Lets go!",
    clickCallback: () => {},
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

<Page>
  <div class="sessionList">
    <SessionList localPlayer={localPlayer} {sessions} />
  </div>
</Page>

<!-- <Page>
  <div class="gameLobby" in:fade={{ duration: 1000, delay: 300 }} out:fade>
    {#if lobbyStep === 0}
      <MenuWrapper>
        <h5>Enter game code to create or join a game lobby</h5>

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
</Page> -->

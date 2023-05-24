<script lang="ts">
  //Interfaces
  import type { Button90Config } from "../../../../interfaces/menu"

  //Svelte
  import { onMount } from "svelte"

  //Stores
  import { menu, showLoginPage, showMenu, isLoggedIn, showLobby } from "../../../../stores/stores"

  import { createSpaceObject } from "../../../../lib/factory"
  import { getMenu } from "../../../../lib/menu"
  import { Game } from "../../../../lib/game"
  import { removeKeyControllers } from "../../../../lib/input"

  import { fade } from "svelte/transition"

  //Components
  import GameLobby from "../GameLobby/GameLobby.svelte"

  let game: Game

  let menuOpen = true
  let loggedIn = false

  let showGameLobby = true

  showLobby.subscribe((showLobbyValue: boolean) => {
    showGameLobby = showLobbyValue
  })

  showMenu.set(menuOpen)

  isLoggedIn.set(loggedIn)

  isLoggedIn.subscribe((isLoggedInValue: boolean) => {
    loggedIn = isLoggedInValue
  })

  showMenu.subscribe((showMenuValue: boolean) => {
    menuOpen = showMenuValue
  })

  $: display = menuOpen ? "flex" : "none"

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showLobby.set(true)
  })

  export function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  // let localPlayer: SpaceObject

  // Variables to subscribe on menu store
  let chosenMenu: Button90Config[]

  onMount(() => {
    const localPlayer = createSpaceObject("LocalPlayer")
    game = new Game(getCanvas(), localPlayer, showDeadMenu)

    // Setting welcome menu
    // menu.set(getMenu(game))
    showLoginPage.set(false)
    // Subscribing on store
    menu.subscribe((value) => {
      chosenMenu = value
    })
    game.startWelcomeScreen()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    menu.set(getMenu(game))
    showMenu.set(true)
  }
</script>

<style>
  #game_menu {
    color: #fff;
    justify-content: center;
    align-content: center;
  }

  #game_canvas {
    max-width: 4000px;
    max-height: 3000px;
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    /* cursor: none; */
  }

  #menuWrapper {
    height: 35vh;
    display: flex;
    flex-flow: wrap;
    justify-content: center;
    align-content: center;
  }

  @media only screen and (min-width: 800px) {
    #menuWrapper {
      height: 50vh;
      display: flex;
      flex-flow: wrap;
      justify-content: center;
      align-content: center;
    }
  }

  .gameLobby {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
  }
</style>

<canvas id="game_canvas" />

{#if game}
  <div id="menuWrapper" in:fade={{ duration: 600, delay: 150 }}>
    {#if showGameLobby}
      <div class="gameLobby">
        <GameLobby {game} />
      </div>
    {/if}
  </div>
{/if}

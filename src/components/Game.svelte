<script lang="ts">
  import Menu90 from "./shared/menu/Menu90.svelte"

  import type { Button90Config, User } from "./interface"

  import { onMount } from "svelte"

  import { createSpaceObject } from "../lib/factory"
  import { menu, showLoginPage, showMenu, isLoggedIn, showLobby } from "../lib/stores"
  import { getMenu } from "../lib/menu"
  import { Game } from "../lib/game"
  import { removeKeyControllers } from "../lib/input"

  import { fade } from "svelte/transition"

  import { validateToken } from "../lib/services/utils/Token"
  import Header from "./header.svelte"
  import GameLobby from "./GameLobby.svelte"

  let menuOpen = true
  let loggedIn = false

  let showGameLobby = false

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
    if (e.key === "Escape" && !showGameLobby) menuOpen = !menuOpen
  })

  export function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  let game: Game

  // let localPlayer: SpaceObject

  // Variables to subscribe on menu store
  let chosenMenu: Button90Config[]

  onMount(() => {
    validateToken()

    const localPlayer = createSpaceObject("LocalPlayer")
    game = new Game(getCanvas(), localPlayer, showDeadMenu)

    // Setting welcome menu
    menu.set(getMenu(game))
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
    position: absolute;
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

<Header />

<canvas id="game_canvas" />

{#if game}
  <div id="menuWrapper" in:fade={{ duration: 600, delay: 150 }}>
    {#if showGameLobby}
      <div class="gameLobby">
        <GameLobby {game} />
      </div>
    {/if}
    <div id="game_menu" style:display>
      <Menu90 {menuOpen} buttons={chosenMenu} />
    </div>
  </div>
{/if}

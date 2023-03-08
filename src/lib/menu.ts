import type { Game } from "./game"
import type { Button90Config } from "../components/interface"
import { menu, showMenu, showLobby } from "./stores"
import { createButton90Config } from "./factory"

// Keep selected state:
let inGameMenu: Button90Config[]
let startupMenu: Button90Config[]

// Function returns the correct menu configuration depending on
// the current game state:
export function getMenu(game: Game, keepLastSelected = false) {
  // Pick menu depending on game state:
  let stateMenu: Button90Config[]

  // Create all buttons as variables so they can be reused in
  // multiple menu item collections (Button90Config[]'s):
  const singlePlayer = createButton90Config("Singleplayer")
  const settings = createButton90Config("Settings")
  const about = createButton90Config("About")

  const createGame = createButton90Config(
    "Create game",
    async () => {
      await game.stopGame()

      // Start multiplayer on the game object
      // Need a timeout so the welcomeScreen gets time to stop on next render()
      game.startMultiplayer()
      // Get and set the menu depending by the game state
      // We dont care what the user selected the last time this menu was shown:
      menu.set(getMenu(game, false))

      // Hide the menu when starting a new game:
      showMenu.set(false)
    },
    true
  )
  const joinGame = createButton90Config("Join game", () => {
    showLobby.set(true)
    showMenu.set(false)
  })

  const spectate = createButton90Config("Spectate", () => {
    showMenu.set(false)
  })

  const multiPlayer = createButton90Config("Multiplayer", async () => {
    startupMenu = [createGame, joinGame, exitGame]
    menu.set(startupMenu)
  })

  const exitGame = createButton90Config("Quit", async () => {
    console.log("exit game")
    //player is alive again
    game.localPlayer.isDead = false

    // Start multiplayer on the game object
    // Stop the current game:
    // If game is welcomescreen, no need to run, since welcomescreen already running
    if (game.type !== 2) {
      await game.stopGame()
      game.startWelcomeScreen()
    }

    // Keep the selection on the last selected item in the menu:
    menu.set(getMenu(game, true))

    // Show the menu when quitting a game:
    showMenu.set(true)
  })

  //Always set startupMenu on rerender
  startupMenu = [singlePlayer, multiPlayer, settings, about]
  singlePlayer.selected = true

  if (game.isRunning()) {
    // If inGameMenu is undefined we have to create it - there is no selected item
    if (!keepLastSelected || !inGameMenu) {
      // Default selected item:
      settings.selected = true

      // Set the module local variable
      inGameMenu = [settings, exitGame]
    }

    // Selected menu if game is running
    stateMenu = inGameMenu
  } else {
    // Selected menu if game is not running:
    stateMenu = startupMenu
  }

  // If player is dead
  if (game.localPlayer.isDead) {
    settings.selected = false
    spectate.selected = true

    stateMenu = [spectate, settings, exitGame]
  }

  // Return the collection of menu item buttons

  return stateMenu
}

import type { Game } from "./game"
import type { Button90Config } from "../components/interface"
import { menu, showMenu, showLobby, showLoginModal as showProfile, isLoggedIn } from "./stores"

// Keep selected state:
let inGameMenu: Button90Config[]
let startupMenu: Button90Config[]

export function createButton90Config(
  buttonText = "Button90",
  clickCallback = () => {
    console.log(`${buttonText} selected`)
  },
  selected = false
): Button90Config {
  return {
    buttonText: buttonText,
    clickCallback: clickCallback,
    selected: selected,
  }
}

// Function returns the correct menu configuration depending on
// the current game state:
export function getMenu(game: Game, keepLastSelected = false) {
  // Pick menu depending on game state:
  let stateMenu: Button90Config[]

  let userLoggedIn = false

  isLoggedIn.subscribe((value) => {
    userLoggedIn = value
    console.log("isLoggedIn ", value)
  })

  // Create all buttons as variables so they can be reused in
  // multiple menu item collections (Button90Config[]'s):
  const singlePlayer = createButton90Config("Singleplayer")
  const settings = createButton90Config("Settings")
  const profile = createButton90Config("Profile", () => {
    showProfile.set(true)
  })

  const about = createButton90Config("About", () => {
    window.open("https://github.com/eransed/oids", "_blank")
  })

  const spectate = createButton90Config("Spectate", () => {
    showMenu.set(false)
  })

  const multiPlayer = createButton90Config("Play", async () => {
    showLobby.set(true)
    showMenu.set(false)
  })

  const exitGame = createButton90Config("Quit", async () => {
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
  startupMenu = [multiPlayer, profile, about]
  singlePlayer.selected = true

  if (game.isRunning()) {
    // If inGameMenu is undefined we have to create it - there is no selected item
    if (!keepLastSelected || !inGameMenu) {
      // Default selected item:
      settings.selected = true

      // Set the module local variable
      inGameMenu = [exitGame]
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

    stateMenu = [spectate, exitGame]
  }

  // Return the collection of menu item buttons

  return stateMenu
}

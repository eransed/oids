import type { Game } from './game'
import type { Button90Config } from '../components/interface'
import { menu, showMenu } from './stores'
import { createButton90Config } from './factory'

// Keep selected state:
let inGameMenu: Button90Config[]
let startupMenu: Button90Config[]

// Function returns the correct menu configuration depending on
// the current game state:
export function getMenu(game: Game, keepLastSelected = false) {

  // Create all buttons as variables so they can be reused in
  // multiple menu item collections (Button90Config[]'s):
  const singlePlayer = createButton90Config('Singleplayer')
  const settings = createButton90Config('Settings')
  const about = createButton90Config('About')

  const multiPlayer = createButton90Config('Multiplayer', () => {
      // Start multiplayer on the game object
      game.startMultiplayer()

      // Get and set the menu depending by the game state
      // We dont care what the user selected the last time this menu was shown:
      menu.set(getMenu(game, false))

      // Hide the menu when starting a new game:
      showMenu.set(false)
  })

  const exitGame = createButton90Config('Quit', () => {
    // Start multiplayer on the game object
    // Stop the current game:
    game.stopGame()

    // Keep the selection on the last selected item in the menu:
    menu.set(getMenu(game, true))

    // Show the menu when quitting a game:
    showMenu.set(true)
  })

  // Pick menu depending on game state:
  let stateMenu: Button90Config[]

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

    // If startupMenu is undefined we have to create it - there is no last selected item
    if (!keepLastSelected || !startupMenu) {

      // Default selected item:
      singlePlayer.selected = true

      // Set the module local variable:
      startupMenu = [singlePlayer, multiPlayer, settings, about]
    }

    // Selected menu if game is not running:
    stateMenu = startupMenu
  }

  // Return the collection of menu item buttons
  return stateMenu

}

import type { Button90Config } from "../../../../interfaces/menu"
import type { Game } from "../../../../lib/game"

import { navigate } from "svelte-routing"
import { stopGame } from "../Game/Utils/gameUtils"

export const GameMenuButtons = (Game: Game): Button90Config[] => {
  const settings: Button90Config = {
    buttonText: "Settings",
    clickCallback() {
      console.log("settings please")
    },
    selected: false,
  }

  const continueGame: Button90Config = {
    buttonText: "Continue",
    clickCallback() {
      console.log("continue game aka close menu")
    },
    selected: false,
  }

  const exit: Button90Config = {
    buttonText: "Exit game",
    clickCallback() {
      stopGame(Game)
      navigate("/play/multiplayer/end")
    },
    selected: false,
  }

  return [continueGame, settings, exit]
}

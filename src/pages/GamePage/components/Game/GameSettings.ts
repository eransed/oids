//Interfaces
import { showHotKeys, showScoreScreen } from "./store/gameStores"

import type { GameSettings, KeyFunction } from "../../../../lib/interface"

//Utils
import { addKeyDownListener } from "../../../../stores/eventListenerStore"

function handleKeyPress(e: KeyboardEvent) {
  Object.values(gameSettings).map((keyFunction: KeyFunction) => {
    keyFunction.activators.forEach((key: string) => {
      if (e.key === key) {
        if (keyFunction.store) {
          keyFunction.store.set((keyFunction.keyStatus = !keyFunction.keyStatus))
        } else keyFunction.keyStatus = !keyFunction.keyStatus
      }
    })
  })
}

export const gameSettings: GameSettings = {
  systemGraphs: { activators: ["g"], keyStatus: false },
  scoreScreen: { activators: ["p"], keyStatus: false, store: showScoreScreen },
  hotKeys: { activators: ["o"], keyStatus: false, store: showHotKeys },
}

export function initSettingsControl(): () => void {
  const cleanup = addKeyDownListener(handleKeyPress)
  return cleanup
}

//Interfaces
import type { GameSettings } from "../../../../lib/interface"

//Utils
import { addKeyDownListener } from "../../../../stores/eventListenerStore"

function handleKeyPress(e: KeyboardEvent) {
  Object.values(gameSettings).map((keyFunction) => {
    keyFunction.activators.forEach((key: string) => {
      if (e.key === key) {
        console.log(keyFunction.keyStatus)
        keyFunction.keyStatus = !keyFunction.keyStatus
      }
    })
  })
}

export const gameSettings: GameSettings = {
  showSystemGraphs: { activators: ["g"], keyStatus: false },
}

export function initSettingsControl(): () => void {
  const cleanup = addKeyDownListener(handleKeyPress)
  return cleanup
}

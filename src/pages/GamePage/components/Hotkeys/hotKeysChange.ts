import type { KeyFunctionStore } from '../../../../lib/interface'
import { activeHotKeys, savedHotkeysStore } from '../../../../lib/input'
import { GameMode } from '../../../../lib/game'
import { convertSavedHotkeys } from '../../../../utils/utils'

interface submitHotkeyChangeProps {
  keyFunctionArray: KeyFunctionStore[]
  keyFunction: KeyFunctionStore
  del?: boolean
  chosenKey: string
  mode: GameMode
}

export const submitHotkeyChange = ({ keyFunctionArray, keyFunction, del = false, chosenKey, mode }: submitHotkeyChangeProps): KeyFunctionStore[] => {
  checkExistingKeyMap(keyFunctionArray, chosenKey)

  if (del) {
    deleteHotkey(keyFunction, chosenKey)
  } else {
    keyFunction.activators.push(chosenKey)
    activeHotKeys.update((d) => d)
  }

  localStorage.setItem(GameMode[mode], JSON.stringify(keyFunctionArray))

  const convertedToSave = convertSavedHotkeys(keyFunctionArray)

  savedHotkeysStore.update((v) => {
    if (mode === GameMode.SPACE_MODE) {
      if (v?.spaceMode) {
        v.spaceMode = convertedToSave
      }
    }
    if (mode === GameMode.ARCADE_MODE) {
      if (v?.arcadeMode) {
        v.arcadeMode = convertedToSave
      }
    }
    return v
  })

  return keyFunctionArray
}

function checkExistingKeyMap(keyMap: KeyFunctionStore[], chosenKey: string) {
  for (let i = 0; i < keyMap.length; i++) {
    keyMap[i].activators.map((v) => {
      if (v === chosenKey) {
        deleteHotkey(keyMap[i], chosenKey)
      }
    })
  }
}

function deleteHotkey(keyFunction: KeyFunctionStore, chosenKey: string) {
  keyFunction.activators = keyFunction.activators.filter((item) => item !== chosenKey)

  activeHotKeys.update((d) => d)
  // console.log(`Deleted ${chosenKey} from ${keyFunction.displayText}`)
  return `Deleted ${chosenKey} from ${keyFunction.displayText}`
}

import type { KeyFunctionStore, KeyMapManager } from '../../../../lib/interface'
import { activeHotKeys, keyFuncArrayFromKeyFunctionMap } from '../../../../lib/input'
import { GameMode } from '../../../../lib/interface'

interface submitHotkeyChangeProps {
  keyFunction: KeyFunctionStore
  del?: boolean
  chosenKey: string
  mode: GameMode
  keyMapManager: KeyMapManager
}

export const submitHotkeyChange = ({ keyFunction, del = false, chosenKey, mode, keyMapManager }: submitHotkeyChangeProps): KeyFunctionStore[] => {
  const newKeyMap = { ...keyMapManager.getKeyMap() }

  checkExistingKeyMap(keyFuncArrayFromKeyFunctionMap(newKeyMap), chosenKey)

  //implement keymapmanager changing to new keymap instead of altering default map
  console.log(keyMapManager)

  if (del) {
    deleteHotkey(keyFunction, chosenKey)
  } else {
    keyFunction.activators.push(chosenKey)
    activeHotKeys.update((d) => {
      return d
    })
  }

  localStorage.setItem(GameMode[mode], JSON.stringify(newKeyMap))

  // const convertedToSave = convertSavedHotkeys(keyFunctionArray)

  // savedHotkeysStore.update((v) => {
  //   if (mode === GameMode.SPACE_MODE) {
  //     if (v?.spaceMode) {
  //       v.spaceMode = convertedToSave
  //     }
  //   }
  //   if (mode === GameMode.ARCADE_MODE) {
  //     if (v?.arcadeMode) {
  //       v.arcadeMode = convertedToSave
  //     }
  //   }
  //   return v
  // })

  return keyFuncArrayFromKeyFunctionMap(newKeyMap)
}

function checkExistingKeyMap(keyMap: KeyFunctionStore[], chosenKey: string) {
  for (let i = 0; i < keyMap.length; i++) {
    if (typeof keyMap[i] !== 'string') {
      keyMap[i].activators.map((v) => {
        if (v === chosenKey) {
          deleteHotkey(keyMap[i], chosenKey)
        }
      })
    }
  }
}

function deleteHotkey(keyFunction: KeyFunctionStore, chosenKey: string) {
  keyFunction.activators = keyFunction.activators.filter((item) => item !== chosenKey)

  activeHotKeys.update((d) => {
    return d
  })
  // console.log(`Deleted ${chosenKey} from ${keyFunction.displayText}`)
  return `Deleted ${chosenKey} from ${keyFunction.displayText}`
}

import type { KeyFunctionStore, KeyMapManager } from '../../../../lib/interface'
import { activeHotKeys, ActiveKeyMapStore, arcadeKeyMapManagerStore, keyFuncArrayFromKeyFunctionMap, spaceKeyMapManagerStore } from '../../../../lib/input'
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

  newKeyMap.name = mode === GameMode.SPACE_MODE ? 'Custom Space' : 'Custom Arcade'

  checkExistingKeyMap(keyFuncArrayFromKeyFunctionMap(newKeyMap), chosenKey)

  //implement keymapmanager changing to new keymap instead of altering default map

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

  keyMapManager.setKeyMap(newKeyMap)
  ActiveKeyMapStore.set(keyMapManager.getKeyMap())
  activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(keyMapManager.getKeyMap()))

  spaceKeyMapManagerStore.update((v) => {
    return v
  })
  arcadeKeyMapManagerStore.update((v) => {
    return v
  })

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

export function resetKeyMapToDefault(keyMapManager: KeyMapManager) {
  keyMapManager.resetKeyMap()
  ActiveKeyMapStore.set(keyMapManager.getKeyMap())
  activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(keyMapManager.getKeyMap()))

  spaceKeyMapManagerStore.update((v) => {
    return v
  })
  arcadeKeyMapManagerStore.update((v) => {
    return v
  })
}

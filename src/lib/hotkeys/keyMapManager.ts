import { type KeyFunctionMap, type KeyMapManager } from '../interface'

export function createKeyMapManager(defaultMap: KeyFunctionMap): KeyMapManager {
  let activeMap = structuredClone(defaultMap)

  return {
    //Reset to default key map

    getDefault: () => {
      return defaultMap
    },

    resetKeyMap: () => {
      activeMap = structuredClone(defaultMap)
    },

    //Optionally set a new key map
    setKeyMap: (newMap: KeyFunctionMap) => {
      activeMap = { ...newMap }
    },

    //Get current active key map
    getKeyMap: () => {
      return { ...activeMap }
    },
  }
}

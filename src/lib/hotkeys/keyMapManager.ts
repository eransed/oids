import { type KeyFunctionMap, type KeyMapManager } from '../interface'

export function createKeyMapManager(defaultMap: KeyFunctionMap): KeyMapManager {
  let activeMap = { ...defaultMap }

  return {
    //Reset to default key map
    resetKeyMap: () => {
      console.log('reseting map')
      activeMap = { ...defaultMap }
    },

    //Optionally set a new key map
    setKeyMap: (newMap: KeyFunctionMap) => {
      activeMap = { ...newMap }
    },

    //Get current active key map
    getKeyMap: () => ({ ...activeMap }),
  }
}

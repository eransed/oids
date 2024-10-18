import { writable, type Writable } from 'svelte/store'
import { GameMode, type Button90Config, type KeyMapManager } from '../../lib/interface'

import { Icons } from '../../style/icons'
import { activeHotKeys, ActiveKeyMapStore, arcadeKeyMapManagerStore, keyFuncArrayFromKeyFunctionMap, spaceKeyMapManagerStore } from '../../lib/input'
import { localPlayerStore } from '../../stores/stores'

interface ProfileButton {
  icon: string
  config: Button90Config
}

let spaceKeyMapManager: KeyMapManager
let arcadeKeyMapManager: KeyMapManager

spaceKeyMapManagerStore.subscribe((v) => (spaceKeyMapManager = v))
arcadeKeyMapManagerStore.subscribe((v) => (arcadeKeyMapManager = v))

const controlsSpace: ProfileButton = {
  icon: Icons.Play,
  config: {
    buttonText: 'Controls Space',
    clickCallback: () => {
      ActiveKeyMapStore.set(spaceKeyMapManager.getKeyMap())
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(spaceKeyMapManager.getKeyMap()))
      settingsComponent.set('controlsSpace')
      localPlayerStore.update((v) => {
        v.gameMode = GameMode.SPACE_MODE
        return v
      })
    },
    routeParam: 'controlsSpace',
    selected: false,
  },
}

const controlsArcade: ProfileButton = {
  icon: Icons.MoonLanding,
  config: {
    buttonText: 'Controls Arcade',
    clickCallback: () => {
      ActiveKeyMapStore.set(arcadeKeyMapManager.getKeyMap())
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(arcadeKeyMapManager.getKeyMap()))
      localPlayerStore.update((v) => {
        v.gameMode = GameMode.ARCADE_MODE
        return v
      })
      settingsComponent.set('controlsArcade')
    },
    routeParam: 'controlsArcade',
    selected: false,
  },
}

export const SettingsButtons = { controlsSpace, controlsArcade }

//Stores
export const settingsComponent: Writable<string> = writable(controlsSpace.config.routeParam)

import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../lib/interface'

import { Icons } from '../../style/icons'
import { activeHotKeys, ActiveKeyMapStore, arcadeKeyMapManager, keyFuncArrayFromKeyFunctionMap, spaceKeyMapManager } from '../../lib/input'

interface ProfileButton {
  icon: string
  config: Button90Config
}

const controlsSpace: ProfileButton = {
  icon: Icons.Play,
  config: {
    buttonText: 'Controls Space',
    clickCallback: () => {
      ActiveKeyMapStore.set(spaceKeyMapManager.getKeyMap())
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(spaceKeyMapManager.getKeyMap()))
      settingsComponent.set('controlsSpace')
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
      settingsComponent.set('controlsArcade')
    },
    routeParam: 'controlsArcade',
    selected: false,
  },
}

export const SettingsButtons = { controlsSpace, controlsArcade }

//Stores
export const settingsComponent: Writable<string> = writable(controlsSpace.config.routeParam)

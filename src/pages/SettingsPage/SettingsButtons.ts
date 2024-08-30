import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../lib/interface'

import { Icons } from '../../style/icons'

interface ProfileButton {
  icon: string
  config: Button90Config
}

const controlsSpace: ProfileButton = {
  icon: Icons.Play,
  config: {
    buttonText: 'Controls Space',
    clickCallback: () => {
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
      settingsComponent.set('controlsArcade')
    },
    routeParam: 'controlsArcade',
    selected: false,
  },
}

export const SettingsButtons = { controlsSpace, controlsArcade }

//Stores
export const settingsComponent: Writable<string> = writable(controlsSpace.config.routeParam)

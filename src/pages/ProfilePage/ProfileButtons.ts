import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../lib/interface'

//Stores
export const profileComponent: Writable<string> = writable('settings')

import { Icons } from '../../style/icons'

interface ProfileButton {
  icon: string
  config: Button90Config
}

const shipStation: ProfileButton = {
  icon: Icons.MoonRover,
  config: {
    buttonText: 'Ship Station',
    clickCallback: () => {
      profileComponent.set('shipStation')
    },
    routeParam: 'shipStation',
    selected: false,
  },
}

const settings: ProfileButton = {
  icon: Icons.Settings,
  config: {
    buttonText: 'User settings',
    clickCallback: () => {
      profileComponent.set('settings')
    },
    routeParam: 'settings',
    selected: false,
  },
}

const ProfileButtons = { settings, shipStation }

export { ProfileButtons }

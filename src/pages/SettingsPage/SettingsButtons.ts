import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../lib/interface'



import { Icons } from '../../style/icons'

interface ProfileButton {
  icon: string
  config: Button90Config
}



const controls: ProfileButton = {
  icon: Icons.Play,
  config: {
    buttonText: 'Controls',
    clickCallback: () => {
      settingsComponent.set('controls')
    },
    routeParam: 'controls',
    selected: false,
  },
}

export const SettingsButtons = { controls }

//Stores
export const settingsComponent: Writable<string> = writable(controls.config.routeParam)
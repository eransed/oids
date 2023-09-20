import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../interfaces/menu'

//Stores
export const profileComponent: Writable<string> = writable('summary')

const summary: Button90Config = {
  buttonText: 'User info',
  clickCallback: () => {
    profileComponent.set('summary')
  },
  routeParam: 'summary',
  selected: false,
}

const shipStation: Button90Config = {
  buttonText: 'Ship Station',
  clickCallback: () => {
    profileComponent.set('shipStation')
  },
  routeParam: 'shipStation',
  selected: false,
}

const matchHistory: Button90Config = {
  buttonText: 'Match history',
  clickCallback: () => {
    profileComponent.set('matchHistory')
  },
  routeParam: 'matchHistory',
  selected: false,
}

const settings: Button90Config = {
  buttonText: 'Settings',
  clickCallback: () => {
    profileComponent.set('settings')
  },
  routeParam: 'settings',
  selected: false,
}

const ProfileButtons = { summary, shipStation, matchHistory, settings }

export { ProfileButtons }

import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../../interfaces/menu'
import ProfileModal from '../../components/profile/ProfileModal.svelte'
import type { ComponentConstructorOptions } from 'svelte'

//Stores
export const profileComponent: Writable<string> = writable('summary')

const summary: Button90Config = {
 buttonText: 'Summary',
 clickCallback: () => {
  profileComponent.set('summary')
 },
 routeParam: 'summary',
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

const ProfileButtons = { summary, matchHistory, settings }

export { ProfileButtons }

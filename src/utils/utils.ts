import { rndi } from 'mathil'
import { isLoggedInStore, localPlayerStore, settingsStore, userStore } from '../stores/stores'
// import type { Prisma, User } from '@prisma/client'
import { createSpaceObject } from '../lib/factory'
import type { GameModeHotkeys, KeyFunction, KeyFunctionMap, KeyFunctionStore, User } from '../lib/interface'
import { activeHotKeys, ActiveKeyMapStore, capitalFirstChar, DefaultArcadeModeKeyMap, DefaultSpaceModeKeyMap, keyFuncArrayFromKeyFunctionMap, savedHotkeysStore } from '../lib/input'
import { GameMode } from '../lib/game'

export function getLocationURL() {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  } else {
    return 'localhost'
  }
}

export function createSessionId(): string {
  return `s-${rndi(1, 10000)}`
}

export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const f = new Intl.DateTimeFormat('en-SE', {
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  return f.format(date)
}

export const handleLogout = (): void => {
  localStorage.clear()
  isLoggedInStore.set(false)
  userStore.set(gUser)
  localPlayerStore.set(createSpaceObject(gUser.name))
  localStorage.clear()
}

export const createdGuestName = `p-${rndi(1, 900000)}`

export const gUser: User = {
  id: createdGuestName,
  email: '',
  name: createdGuestName,
  password: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'guest',
  theme: 0,
  played: 0,
  image: '',
  ships: [],
  gameHistory: [],
  hotkeys: { spaceMode: DefaultSpaceModeKeyMap, arcadeMode: DefaultArcadeModeKeyMap },
}

export function convertSavedHotkeys(savedHotkeysJson: any): KeyFunctionMap {
  const convertedHotkeys: KeyFunctionMap = { ...DefaultArcadeModeKeyMap }

  savedHotkeysJson.forEach((hotkey: KeyFunctionStore) => {
    if (hotkey.displayText) {
      const key = hotkey.displayText
        .replace(/([A-Z])/g, ' $1') // Add space before each capital letter
        .trim() // Remove leading and trailing spaces
        .replace(/\s+/g, '') // Remove spaces to match original key format
        .replace(/([A-Z])/g, (match, p1, offset) => (offset === 0 ? p1.toLowerCase() : p1)) as keyof KeyFunctionMap

      // Add the hotkey object to the converted hotkeys map
      convertedHotkeys[key] = hotkey
    }
  })

  return convertedHotkeys
}

function resetAllButtons(keyFuncMap: KeyFunctionMap) {
  Object.values(keyFuncMap).forEach((v: KeyFunctionStore) => {
    v.keyStatus = false
    v.store = false
  })
}

export function checkHotkeys(): GameModeHotkeys | undefined {
  const savedSpaceHotkeysJson = localStorage.getItem(GameMode[GameMode.SPACE_MODE])
  const savedArcadeHotkeysJson = localStorage.getItem(GameMode[GameMode.ARCADE_MODE])

  let spaceHotkeys: KeyFunctionMap = DefaultSpaceModeKeyMap
  let arcadeHotkeys: KeyFunctionMap = DefaultArcadeModeKeyMap

  if (!savedSpaceHotkeysJson && !savedArcadeHotkeysJson) {
    console.log('%cUsing default hotkeys. No saved hotkeys found.', 'color:red')
    return undefined
  }

  try {
    if (savedSpaceHotkeysJson) {
      const convertedSpaceHotkeys = convertSavedHotkeys(JSON.parse(savedSpaceHotkeysJson))
      if (convertedSpaceHotkeys) {
        spaceHotkeys = convertedSpaceHotkeys
        resetAllButtons(spaceHotkeys)
      }
      console.log('saved spaceHotkeys ', spaceHotkeys)
    }

    if (savedArcadeHotkeysJson) {
      const convertedArcadeHotkeys = convertSavedHotkeys(JSON.parse(savedArcadeHotkeysJson))

      if (convertedArcadeHotkeys) {
        arcadeHotkeys = convertedArcadeHotkeys
        resetAllButtons(arcadeHotkeys)
      }
      console.log('saved arcadeHotkeys ', arcadeHotkeys)
    }
  } catch (error) {
    console.error('Failed to parse saved hotkeys JSON:', error)
    console.log('%cUsing default hotkeys due to JSON parse error.', 'color:red')
    return undefined
  }

  const hotkeys = { spaceMode: spaceHotkeys, arcadeMode: arcadeHotkeys }
  savedHotkeysStore.set(hotkeys)

  return hotkeys
}

export function resetHotkeysToDefault(mode: GameMode) {
  console.log(`Reseting ${GameMode[mode]}`)

  localStorage.removeItem(GameMode[mode])

  if (mode === GameMode.SPACE_MODE) {
    console.log('reseting')

    ActiveKeyMapStore.set(DefaultSpaceModeKeyMap)
    activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(DefaultSpaceModeKeyMap))
    resetAllButtons(DefaultSpaceModeKeyMap)
  }

  if (mode === GameMode.ARCADE_MODE) {
    console.log('reseting')

    ActiveKeyMapStore.set(DefaultArcadeModeKeyMap)
    activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(DefaultArcadeModeKeyMap))
    resetAllButtons(DefaultArcadeModeKeyMap)
  }

  console.log(DefaultSpaceModeKeyMap)
}

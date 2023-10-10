import { setGraphLineColor } from '../lib/constants'
import { setGameSettings } from '../pages/GamePage/components/Game/Utils/mainGame'
import type { Settings, Theme, UIStyle } from './styleInterfaces'
import { info } from 'mathil'

export function getThemeNumber(theme: Theme): number {
  let themeNr = 0

  themes.filter((t, i) => {
    if (t.name === theme.name) {
      themeNr = i
    }
  })

  return themeNr
}

export const alertColors = {
  error: '#fdeded',
  warning: '#fff4e5',
  info: '#e5f6fd',
  success: '#bbffbb',
}

export const DeepMidnight: Theme = {
  name: 'DeepMidnight',
  bg: '#000033',
  card: '#000022',
  text: '#CCCCCC',
  accent: '#8B7BFF',
}

export const LightMode: Theme = {
  name: 'LightMode',
  bg: '#EAEAEA',
  card: '#F5F5F5',
  text: '#555555',
  accent: '#98AFC7',
}

export function cnvTheme(t: Theme): UIStyle {
  const armed = '#0f0'
  const s: UIStyle = {
    unarmedShotColor: t.accent,
    armedShotColor: t.text,
    shipColor: t.text,
    spaceColor: t.bg,
    starColor: t.text,
  }
  return s
}

export function setCssFromSettings(theme: number): void {
  currentThemeIndex = theme

  syncThemeWithCss(themes[theme])
  setGraphLineColor(themes[theme].text)
  const sets: Settings = {
    uiStyle: cnvTheme(themes[theme]),
    theme: themes[theme],
  }
  setGameSettings(sets)
}

export const themes: Theme[] = [DeepMidnight, LightMode]

let currentThemeIndex = 0

let currentTheme = themes[currentThemeIndex]

export function syncThemeWithCss(t: Theme = currentTheme) {
  document.documentElement.style.setProperty('--main-bg-color', `${t.bg}`)
  document.documentElement.style.setProperty('--main-text-color', `${t.text}`)
  document.documentElement.style.setProperty('--main-card-color', `${t.card}`)
}

export function getCurrentTheme(): Theme {
  return currentTheme
}

export function getCurrentStyle(): UIStyle {
  return cnvTheme(currentTheme)
}

export function toggleAndGetTheme(): Settings {
  currentThemeIndex++
  if (currentThemeIndex >= themes.length) {
    currentThemeIndex = 0
  }
  info(`index: ${currentThemeIndex}`)
  currentTheme = themes[currentThemeIndex]
  console.log(currentTheme)
  setCssFromSettings(currentThemeIndex)

  const sets: Settings = {
    uiStyle: cnvTheme(currentTheme),
    theme: currentTheme,
  }
  return sets
}

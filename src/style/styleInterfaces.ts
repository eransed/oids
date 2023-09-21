export interface Settings {
  uiStyle: UIStyle
  theme: Theme
}

export interface UIStyle {
  unarmedShotColor: string
  armedShotColor: string
  shipColor: string
  spaceColor: string
  starColor: string
}

export interface Theme {
  bg: string
  card: string
  text: string
  accent: string
}
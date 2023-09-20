import type { UIStyle } from "../../../../../lib/interface"

export function getDefaultTheme (): UIStyle {
    const themeTextColor = document.documentElement.style.getPropertyValue('--main-text-color')
    const spaceColor = document.documentElement.style.getPropertyValue('--main-bg-color')


    const s: UIStyle = {
        unarmedShotColor: themeTextColor,
        armedShotColor: '#0f0',
        shipColor: ' ',
        spaceColor: spaceColor,
        starColor: themeTextColor
    }
    console.log(s)
    return s 

}




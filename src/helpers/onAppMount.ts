import { info } from 'mathil'
import { validateToken } from '../lib/services/utils/Token'
import { user, settings } from '../stores/stores'

/**
 * Asynchronus function that runs at startup.
 * While this function is running the app is in a loading state.
 * Use this function to add functionality that needs to run before app starts.
 */
export const onAppMount = async (): Promise<void> => {
  info('onAppmount')
  await validateToken().then((d) => {
    if (d?.darkMode) {
      settings.set({
        darkMode: d?.darkMode,
        uiStyle: {
          unarmedShotColor: '',
          armedShotColor: '',
          shipColor: '',
          spaceColor: '',
        },
      })
    }
  })
}

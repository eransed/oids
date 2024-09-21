import { info } from 'mathil'
import { validateToken } from '../lib/services/utils/Token'
import { addAlert, alertStore, getAllAlerts, logInfo, updateAlertStoreFromLocalStorage } from '../stores/alertHandler'

/**
 * Asynchronus function that runs at startup.
 * While this function is running the app is in a loading state.
 * Use this function to add functionality that needs to run before app starts.
 */
export const onAppMount = async (): Promise<void> => {
  updateAlertStoreFromLocalStorage()
  info('onAppmount')
  addAlert('success', 'Welcome to Oids :)')
  logInfo('Hey')

  // checkHotkeys()

  return new Promise<void>((resolve, reject) => {
    validateToken()
      .then(() => {
        resolve()
      })
      .catch((err) => {
        reject(err)
      })
  })
}

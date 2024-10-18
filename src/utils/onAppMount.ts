import { validateToken } from '../lib/services/utils/Token'
import { addAlert, alertStore, getAllAlerts, logInfo, updateAlertStoreFromLocalStorage } from '../components/alert/alertHandler'

/**
 * Asynchronous function that runs at startup.
 * While this function is running the app is in a loading state.
 * Use this function to add functionality that needs to run before app starts.
 */
export const onAppMount = async (): Promise<void> => {
  // updateAlertStoreFromLocalStorage()
  addAlert('success', 'Welcome to Oids :)')
  // logInfo('Hey - This is a silent log message')

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

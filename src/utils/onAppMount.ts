import { info } from 'mathil'
import { validateToken } from '../lib/services/utils/Token'
import { checkHotkeys } from './utils'
import { capitalFirstChar, savedHotkeysStore } from '../lib/input'
import type { KeyFunctionStore } from '../lib/interface'

/**
 * Asynchronus function that runs at startup.
 * While this function is running the app is in a loading state.
 * Use this function to add functionality that needs to run before app starts.
 */
export const onAppMount = async (): Promise<void> => {
  info('onAppmount')

  checkHotkeys()

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

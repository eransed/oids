import { writable, type Writable } from 'svelte/store'
import type { AlertType } from './AlertType'
import { error, info, warn } from 'mathil'

export const alertStore: Writable<AlertType[]> = writable([])
export let timeOutList: NodeJS.Timeout[] = []

let alertLength = 1
const alertRemovalInterval = 250

alertStore.subscribe((v) => {
  alertLength = v.filter((v) => v.active).length
})

// before anyone can call any log function
updateAlertStoreFromLocalStorage()

export function logInfo(text: string, silent = false) {
  addAlert('info', text, 5000, silent)
}

export function logWarning(text: string, silent = false) {
  addAlert('warning', text, 5000, silent)
}

export function logError(text: string, silent = false) {
  addAlert('error', text, 5000, silent)
}

export function addAlert(severity: AlertType['severity'], text: string, timeoutMs = 5000, silent = false) {
  const alert: AlertType = {
    timeStamp: new Date(),
    severity: severity,
    text: text,
    active: !silent,
  }

  switch (severity) {
    case 'success':
      info(alert.text)
      break
    case 'info':
      info(alert.text)
      break
    case 'warning':
      warn(alert.text)
      break
    case 'error':
      error(alert.text)
      break
    default:
      break
  }

  // store events in reverse order, new message come first in the list
  // this affects the render order in the svelte alert list components
  alertStore.update((alerts) => [alert, ...alerts])
  // alertStore.update((alerts) => [...alerts, alert])

  if (!silent) {
    console.log(alertLength)
    handleAlertTimeOut(timeoutMs + alertLength * alertRemovalInterval, alert)
  }

  let allAlerts: AlertType[] = []
  alertStore.subscribe((v) => (allAlerts = v))
  localStorage.setItem('alerts', JSON.stringify(allAlerts))
}

export function getAllAlerts(): AlertType[] {
  const savedAlerts = localStorage.getItem('alerts')

  if (!savedAlerts) {
    return []
  } else {
    return JSON.parse(savedAlerts)
  }
}

/**
 * Calls to addAlert before this function has been called will delete the local storage
 * This function should be called when this module is loaded
 */
export function updateAlertStoreFromLocalStorage() {
  const oldAlertsJson = localStorage.getItem('alerts')
  // console.log(oldAlertsJson)
  let oldAlerts: AlertType[] = []

  if (oldAlertsJson) {
    oldAlerts = JSON.parse(oldAlertsJson)

    for (let i = 0; i < oldAlerts.length; i++) {
      oldAlerts[i].active = false
      oldAlerts[i].timeStamp = new Date(oldAlerts[i].timeStamp)
    }

    alertStore.update((v) => (v = oldAlerts))

    logInfo(`${oldAlerts.length} events in local storage`)
  } else {
    logWarning('no events in local storage')
  }
}

export function clearAlerts() {
  alertStore.set([])
  localStorage.removeItem('alerts')
  logInfo('clear alerts')
}

export function handleAlertTimeOut(timeoutMs: number, alert: AlertType) {
  timeOutList.push(
    setTimeout(() => {
      alertStore.update((alerts) => alerts.map((a) => (a === alert ? { ...alert, active: false } : a)))
    }, timeoutMs),
  )
}

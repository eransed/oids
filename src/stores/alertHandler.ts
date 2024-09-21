import { writable, type Writable } from 'svelte/store'
import type { AlertType } from '../components/alert/AlertType'
import { info } from 'mathil'

export const alertStore: Writable<AlertType[]> = writable([])

export function logInfo(text: string) {
  addAlert('info', text, 1000, true)
}

export function addAlert(severity: AlertType['severity'], text: string, timeoutMs = 5000, silent = false) {
  let allAlerts: AlertType[] = []

  alertStore.subscribe((v) => (allAlerts = v))

  const alert: AlertType = {
    severity: severity,
    text: text,
    active: !silent,
    timeStamp: new Date(),
  }

  alertStore.update((alerts) => [...alerts, alert])

  if (!silent) {
    setTimeout(() => {
      alertStore.update((alerts) => alerts.map((a) => (a === alert ? { ...alert, active: false } : a)))
    }, timeoutMs)
  }

  info(alert.text)

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

export function updateAlertStoreFromLocalStorage() {
  const oldAlertsJson = localStorage.getItem('alerts')
  let oldAlerts: AlertType[] = []

  if (oldAlertsJson) {
    oldAlerts = JSON.parse(oldAlertsJson)

    for (let i = 0; i < oldAlerts.length; i++) {
      oldAlerts[i].active = false
      oldAlerts[i].timeStamp = new Date(oldAlerts[i].timeStamp)
    }

    alertStore.update((v) => (v = oldAlerts))
  }
}

export function clearAlerts() {
  alertStore.set([])
  localStorage.removeItem('alerts')
}

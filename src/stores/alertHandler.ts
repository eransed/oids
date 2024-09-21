import { writable, type Writable } from 'svelte/store'
import type { AlertType } from '../components/alert/AlertType'

export const alertStore: Writable<InternalAlert[]> = writable([])

interface InternalAlert extends AlertType {
  active: boolean
}

export function addAlert(alert: AlertType) {
  const newAlert: InternalAlert = { ...alert, active: true }
  alertStore.update((alerts) => [...alerts, newAlert])

  setTimeout(() => {
    alertStore.update((alerts) => alerts.map((alert) => (alert === newAlert ? { ...alert, active: false } : alert)))
  }, 5000)
}

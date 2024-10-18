export interface AlertType {
  severity: 'error' | 'warning' | 'info' | 'success'
  text: string
  active: boolean
  timeStamp: Date
}

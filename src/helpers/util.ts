import { rndi } from 'mathil'

export function createSessionId(): string {
  return `s-${rndi(1, 10000)}`
}

export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const f = new Intl.DateTimeFormat('en-SE', {
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  return f.format(date)
}

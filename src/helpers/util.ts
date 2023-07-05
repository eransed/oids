import { rndi } from 'mathil'

export function createSessionId(): string {
  return `s-${rndi(1, 10000)}`
}

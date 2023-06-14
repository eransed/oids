import { rndi } from "../lib/math"

export function createSessionId(): string {
  return `s-${rndi(1, 10000)}`
}

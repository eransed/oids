import { xpRequirements } from '../../constants'

export function getShipXpRequirement(level: number) {
  return xpRequirements[level]
}

import type { KeyFunction } from '../../../../lib/interface'
import { activeKeyStates } from '../../../../lib/input'

interface submitHotkeyChangeProps {
  activator: string
  keyFunction: KeyFunction
  del?: boolean
}

export const submitHotkeyChange = ({
  activator,
  keyFunction,
  del = false,
}: submitHotkeyChangeProps) => {
  if (del) {
    keyFunction.activators = keyFunction.activators.filter(
      (item) => item !== activator
    )

    activeKeyStates.update((d) => d)
    console.log(`Deleted ${activator} from ${keyFunction.displayText}`)
    return `Deleted ${activator} from ${keyFunction.displayText}`
  }
  keyFunction.activators.push('h')
  activeKeyStates.update((d) => d)

  return `Added ${activator} to ${keyFunction.displayText}`
}

import type { KeyFunction } from '../../../../lib/interface'
import { activeKeyStates } from '../../../../lib/input'

interface submitHotkeyChangeProps {
  keyMap: KeyFunction[]
  keyFunction: KeyFunction
  del?: boolean
  chosenKey: string
}

export const submitHotkeyChange = ({
  keyMap,
  keyFunction,
  del = false,
  chosenKey,
  }: submitHotkeyChangeProps) => {
  
  checkExistingKeyMap(keyMap, chosenKey)

  if(del) {
    deleteHotkey(keyFunction, chosenKey)
    return
  }

  keyFunction.activators.push(chosenKey)
  activeKeyStates.update((d) => d)
  

}

function checkExistingKeyMap(keyMap: KeyFunction[], chosenKey: string) {
  for (let i = 0; i < keyMap.length; i++){
    keyMap[i].activators.map((v) => {
      if(v === chosenKey) {
        deleteHotkey(keyMap[i], chosenKey)
      }
    })
  }
}

function deleteHotkey(keyFunction: KeyFunction, chosenKey: string){
    
      keyFunction.activators = keyFunction.activators.filter(
        (item) => item !== chosenKey
      )

      activeKeyStates.update((d) => d)
      // console.log(`Deleted ${chosenKey} from ${keyFunction.displayText}`)
      return `Deleted ${chosenKey} from ${keyFunction.displayText}`
    
}
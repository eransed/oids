
export interface Message<T> {
  value: T
}

export interface TestType {
  data: string
}

export function handleMessage<T>(message: Message<T>, messageHandler: (t: T) => void): void {
  messageHandler(message.value)
}

const jsobj: unknown = {dataType: "a string"}

const m: Message<TestType> = {value: <TestType>jsobj}
m.value.data

handleMessage(m, (v) => {
  console.log (v.data)
})








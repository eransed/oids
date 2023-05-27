import { writable } from "svelte/store"
import type { Writable } from "svelte/store"

//Type definition for cleanup function
export type CleanupFunction = () => void

//Writable store to manage the event listener state
export const eventListenerStore: Writable<CleanupFunction | null> = writable(null)

//Function to add the event listener and store the cleanup function
export const addEventListener = (callback: (event: KeyboardEvent) => void): void => {
  const handleKeyDown = (event: KeyboardEvent) => {
    callback(event)
  }

  document.addEventListener("keydown", handleKeyDown)

  eventListenerStore.set(() => {
    document.removeEventListener("keydown", handleKeyDown)
  })
}

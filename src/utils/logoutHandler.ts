import { createSpaceObject } from '../lib/factory'
import { localPlayerStore, userStore } from '../stores/stores'
import { gUser } from './utils'

export const handleLogout = (localPlayerSessionId: string = ''): void => {
  //Clearing access and refresh tokens
  localStorage.clear()

  //Clearing userStore
  userStore.set(undefined)

  //Creating guest-user and copying the same sessionId of the login user

  const guestSo = createSpaceObject(gUser.name)

  guestSo.sessionId = localPlayerSessionId

  localPlayerStore.set(guestSo)
}

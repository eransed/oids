//Interfaces
import type { Button90Config } from '../../interfaces/menu'

//Store
import { isLoggedIn, user, gUser } from '../../stores/stores'

const handleLogout = (): void => {
  localStorage.clear()
  isLoggedIn.set(false)
  user.set(gUser)
}

export const logOutButton: Button90Config = {
  buttonText: 'Log out',
  clickCallback: () => handleLogout(),
  selected: false,
}

export const loginButton: Button90Config = {
  buttonText: 'Log in',
  clickCallback: () => {
    //login
  },
  selected: false,
}

//Interfaces
import type { Button90Config } from '../../interfaces/menu'

//Utils
import { handleLogout } from '../../utils/utils'

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

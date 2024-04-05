//Interfaces
import { navigate } from 'svelte-routing'
import type { Button90Config } from '../../lib/interface'

//Utils
import { getLocationURL, handleLogout } from '../../utils/utils'

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

export const loginGoogle: Button90Config = {
  buttonText: 'Google Sign-in',
  clickCallback: () => {
    // navigate(`${getLocationURL()}:6060/api/v1/auth/google`)
    location.replace(`http://${getLocationURL()}:6060/api/v1/auth/google`)
  },
  selected: false,
}

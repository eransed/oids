//Interfaces
import type { Button90Config } from '../../interfaces/menu'

//Store
import { isLoggedIn } from '../../stores/stores'

const handleLogout = (): void => {
 localStorage.clear()
 isLoggedIn.set(false)
}

export const logOutButton: Button90Config = {
 buttonText: 'Log out',
 clickCallback: () => handleLogout(),
 selected: false,
}

export const loginButton: Button90Config = {
 buttonText: 'Log in',
 clickCallback: () => {},
 selected: false,
}

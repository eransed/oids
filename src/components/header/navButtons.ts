import type { Button90Config } from "../../interfaces/menu"

import { isLoggedIn, user } from "../../stores/stores"

const handleLogout = () => {
  localStorage.clear()
  isLoggedIn.set(false)
  user.set(undefined)
}

export const logOutButton: Button90Config = {
  buttonText: "Log out",
  clickCallback: () => handleLogout(),
  selected: false,
}

export const loginButton: Button90Config = {
  buttonText: "Log in",
  clickCallback: () => {},
  selected: false,
}

export const Play: Button90Config = {
  buttonText: "Play",
  clickCallback: function (): void {
    console.log("Play button")
  },
  selected: false,
}

export const Profile: Button90Config = {
  buttonText: "Profile",
  clickCallback: function (): void {
    console.log("Profile button")
  },
  selected: false,
}

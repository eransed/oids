import { navigate } from "svelte-routing"
import type { Button90Config } from "../../interfaces/menu"

export const Play: Button90Config = {
  buttonText: "Play",
  clickCallback: function (): void {
    navigate("/play")
  },
  selected: false,
}

export const Profile: Button90Config = {
  buttonText: "Profile",
  clickCallback: function (): void {
    navigate("/profile")
  },
  selected: false,
}

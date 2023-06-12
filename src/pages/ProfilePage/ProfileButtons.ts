import type { Button90Config } from "../../interfaces/menu"

import { navigate } from "svelte-routing"

const summary: Button90Config = {
  buttonText: "Summary",
  clickCallback: () => {
    navigate("/profile/summary")
  },
  routeParam: "summary",
  selected: false,
}

const matchHistory: Button90Config = {
  buttonText: "Match history",
  clickCallback: () => {
    navigate("/profile/matchHistory")
  },
  routeParam: "matchHistory",
  selected: false,
}

const settings: Button90Config = {
  buttonText: "Settings",
  clickCallback: () => {
    navigate("/profile/settings")
  },
  routeParam: "settings",
  selected: false,
}

const ProfileButtons = { summary, matchHistory, settings }

export { ProfileButtons }

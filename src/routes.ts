import type { Route } from "./lib/interface"

export const routes = {
  home: <Route>{ path: "/", displayText: "Home" },
  play: <Route>{ path: "/play", displayText: "Play" },
  profile: <Route>{ path: "/profile/:content", displayText: "Profile" },
  game: <Route>{ path: "/play/multiplayer/:id", displayText: "Game" },
  multiplayer: <Route>{ path: "/play/multiplayer", displayText: "Multiplayer" },
  end: <Route>{ path: "/play/multiplayer/end", displayText: "Score Screen" },
  test: <Route>{ path: "/test", displayText: "Test" },
}

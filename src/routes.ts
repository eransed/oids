import type { Route } from './lib/interface'

export const routes = {
  home: <Route>{ path: '/', displayText: 'Home', inHeader: true },
  profile: <Route>{ path: '/profile', displayText: 'Profile', inHeader: true },
  game: <Route>{ path: '/play/:id', displayText: 'Game', inHeader: false },
  play: <Route>{ path: '/play', displayText: 'Play', inHeader: true },
  end: <Route>{ path: '/play/end', displayText: 'Score Screen', inHeader: false },
  test: <Route>{ path: '/test', displayText: 'Test', inHeader: true },
}

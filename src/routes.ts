import type { Route } from './lib/interface'

export const routes = {
 home: <Route>{ path: '/', displayText: 'Home', inHeader: true },
 play: <Route>{ path: '/play', displayText: 'Play', inHeader: false },
 profile: <Route>{ path: '/profile', displayText: 'Profile', inHeader: true },
 game: <Route>{ path: '/play/multiplayer/:id', displayText: 'Game', inHeader: false },
 multiplayer: <Route>{ path: '/play/multiplayer', displayText: 'Multiplayer', inHeader: true },
 end: <Route>{ path: '/play/multiplayer/end', displayText: 'Score Screen', inHeader: false },
 test: <Route>{ path: '/test', displayText: 'Test', inHeader: true },
}

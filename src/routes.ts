import type { Route } from './lib/interface'

import { Icons } from './style/icons'

export const routes = {
  home: <Route>{
    path: '/',
    displayText: 'Home',
    inHeader: true,
    icon: Icons.MoonLanding,
  },
  auth: <Route>{
    path: '/auth-callback',
    displayText: 'Auth Callback',
    inHeader: false,
  },
  profile: <Route>{
    path: '/profile',
    displayText: 'Profile',
    inHeader: true,
    icon: Icons.Astronaut,
  },
  game: <Route>{ path: '/play/:id', displayText: 'Game', inHeader: false },
  play: <Route>{
    path: '/play',
    displayText: 'Play',
    inHeader: true,
    icon: Icons.Play,
  },
  end: <Route>{
    path: '/play/end',
    displayText: 'Score Screen',
    inHeader: false,
  },
  test: <Route>{ path: '/test', displayText: 'Test', inHeader: false },
  settings: <Route>{ path: '/settings', displayText: 'Settings', inHeader: true, icon: Icons.Settings },
  admin: <Route>{ path: '/admin', displayText: 'Admin', inHeader: true, icon: Icons.Admin },
  register: <Route>{ path: '/register', displayText: 'Register', inHeader: false },
}

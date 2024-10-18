<script lang="ts">
  //Routing
  import { Router, Route } from 'svelte-routing'
  import { routes } from './routes'

  //Stores
  import { pageHasHeaderStore } from './stores/stores'

  //Pages
  import LandingPage from './pages/LandingPage/LandingPage.svelte'
  import GamePage from './pages/GamePage/GamePage.svelte'
  import PostGamePage from './pages/PostGamePage/PostGamePage.svelte'
  import ProfilePage from './pages/ProfilePage/ProfilePage.svelte'
  import Header from './components/header/header.svelte'
  import TestPage from './pages/TestPage/TestPage.svelte'
  import AdminPage from './pages/AdminPage/AdminPage.svelte'
  import SettingsPage from './pages/SettingsPage/SettingsPage.svelte'
  import Callback from './pages/Auth/Callback.svelte'
  import GameLobbyServers from './pages/GameLobby/GameLobbyServers.svelte'
  import RegisterPage from './pages/Register/RegisterPage.svelte'
  import AlertList from './components/alert/AlertList.svelte'
  import DevPage from './pages/DevPage/DevPage.svelte'
</script>

<Router>
  {#if $pageHasHeaderStore}
    <Header />
  {/if}
  <Route path={routes.home.path}>
    <LandingPage />
  </Route>
  <Route path={routes.auth.path}>
    <Callback />
  </Route>
  <Route path={routes.game.path} let:params><GamePage gameIdParam={params.id} /></Route>
  <Route path={routes.end.path}><PostGamePage /></Route>
  <Route path={routes.profile.path}>
    <ProfilePage />
  </Route>
  <Route path={routes.play.path}>
    <GameLobbyServers />
  </Route>
  <Route path={routes.test.path}><TestPage /></Route>
  <Route path={routes.admin.path}><AdminPage /></Route>
  <Route path={routes.settings.path}><SettingsPage /></Route>
  <Route path={routes.register.path}><RegisterPage /></Route>
  <Route path={routes.alerts.path}><AlertList /></Route>
  <Route path={routes.dev.path}><DevPage /></Route>
</Router>

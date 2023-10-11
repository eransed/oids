<script lang="ts">
  //Routing
  import { Router, Route } from 'svelte-routing'
  import { routes } from './routes'

  //Stores
  import { pageHasHeader } from './stores/stores'

  //Pages
  import LandingPage from './pages/LandingPage/LandingPage.svelte'
  import GamePage from './pages/GamePage/GamePage.svelte'
  import PostGamePage from './pages/PostGamePage/PostGamePage.svelte'
  import ProfilePage from './pages/ProfilePage/ProfilePage.svelte'
  import Header from './components/header/header.svelte'
  import GameLobby from './pages/GameLobby/GameLobby.svelte'
  import TestPage from './pages/TestPage/TestPage.svelte'
  import AdminPage from './pages/AdminPage/AdminPage.svelte'
</script>

<Router>
  {#if $pageHasHeader}
    <Header />
  {/if}
  <Route path={routes.home.path}>
    <LandingPage />
  </Route>
  <Route path={routes.game.path} let:params><GamePage gameIdParam={params.id} /></Route>
  <Route path={routes.end.path}><PostGamePage /></Route>
  <Route path={routes.profile.path}>
    <ProfilePage />
  </Route>
  <Route path={routes.play.path}>
    <GameLobby />
  </Route>
  <Route path={routes.test.path}><TestPage /></Route>
  <Route path={routes.admin.path}><AdminPage /></Route>
</Router>

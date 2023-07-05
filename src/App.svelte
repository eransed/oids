<script lang="ts">
  //Routes
  import { Router, Route } from 'svelte-routing'
  import { routes } from './routes'

  //Stores
  import { pageHasHeader } from './stores/stores'

  //Helpers
  import { onAppMount } from './helpers/onAppMount'

  //Pages
  import LandingPage from './pages/LandingPage/LandingPage.svelte'
  import PlayPage from './pages/PlayPage/PlayPage.svelte'
  import GamePage from './pages/GamePage/GamePage.svelte'
  import PostGamePage from './pages/PostGamePage/PostGamePage.svelte'
  import ProfilePage from './pages/ProfilePage/ProfilePage.svelte'
  import Header from './components/header/header.svelte'
  import GameLobby from './pages/PlayPage/components/GameLobby/GameLobby.svelte'
  import TestPage from './pages/TestPage/TestPage.svelte'

  //Components
  import Page from './components/page/page.svelte'
  import CircularSpinner from './components/loaders/circularSpinner.svelte'
</script>

{#if $pageHasHeader}
  <Header />
{/if}

<body>
  <Router>
    {#await onAppMount()}
      <Page><CircularSpinner /></Page>
    {:then}
      <Route path={routes.home.path}>
        <LandingPage />
      </Route>
      <Route path={routes.play.path}><PlayPage /></Route>
      <Route path={routes.game.path} let:params><GamePage gameIdParam={params.id} /></Route>
      <Route path={routes.end.path}><PostGamePage /></Route>
      <Route path={routes.profile.path}>
        <ProfilePage />
      </Route>
      <Route path={routes.multiplayer.path}>
        <GameLobby />
      </Route>
      <Route path={routes.test.path}><TestPage /></Route>
    {/await}
  </Router>
</body>

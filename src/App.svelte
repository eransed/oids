<script lang="ts">
  //Routes
  import { Router, Route } from 'svelte-routing'

  import { routes } from './routes'

  //Stores
  import { pageHasHeader, settings, user } from './stores/stores'

  //Helpers
  import { onAppMount } from './helpers/onAppMount'

  //Pages
  import LandingPage from './pages/LandingPage/LandingPage.svelte'
  import GamePage from './pages/GamePage/GamePage.svelte'
  import PostGamePage from './pages/PostGamePage/PostGamePage.svelte'
  import ProfilePage from './pages/ProfilePage/ProfilePage.svelte'
  import Header from './components/header/header.svelte'
  import GameLobby from './pages/GameLobby/GameLobby.svelte'
  import TestPage from './pages/TestPage/TestPage.svelte'

  //Components
  import Page from './components/page/page.svelte'
  import CircularSpinner from './components/loaders/circularSpinner.svelte'
  import AdminPage from './pages/AdminPage/AdminPage.svelte'
  import type { Settings, Theme, UIStyle } from './lib/interface'
  import { setGameSettings } from './pages/GamePage/components/Game/Utils/mainGame'
  import { setGraphLineColor } from './lib/constants'

  $: if ($settings) {
    setCssFromSettings()
  }

  function setCssFromSettings(): void {
    const darkMode = $settings.darkMode

    /**
     * A dark blue midnight theme to be used
     */
    const DeepMidnight: Theme = {
      bg: '#000033',
      card: '#000022',
      font: '#CCCCCC',
      accent: '#8B7BFF',
    }

    document.documentElement.style.setProperty('--main-bg-color', `${darkMode ? DeepMidnight.bg : '#EAEAEA'}`)
    document.documentElement.style.setProperty('--main-text-color', `${darkMode ? DeepMidnight.font : '#555555'}`)
    document.documentElement.style.setProperty('--main-card-color', `${darkMode ? DeepMidnight.card : '#F5F5F5'}`)

    const themeTextColor = document.documentElement.style.getPropertyValue('--main-text-color')
    const spaceColor = document.documentElement.style.getPropertyValue('--main-bg-color')
    const cardColor = document.documentElement.style.getPropertyValue('--main-card-color')

    setGraphLineColor(themeTextColor)

    const uiStyle: UIStyle = {
      unarmedShotColor: themeTextColor,
      armedShotColor: '#0f0',
      shipColor: '',
      spaceColor: spaceColor,
    }

    const sets: Settings = {
      darkMode: darkMode,
      uiStyle: uiStyle,
    }

    setGameSettings(sets)
  }
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
    {/await}
  </Router>
</body>

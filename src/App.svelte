<script lang="ts">
  import { Router, Route } from "svelte-routing"
  import { onMount } from "svelte"
  import { pageHasHeader } from "./stores/stores"

  //Helpers
  import { onAppMount } from "./helpers/onAppMount"

  //Components
  import LandingPage from "./pages/LandingPage/LandingPage.svelte"
  import PlayPage from "./pages/PlayPage/PlayPage.svelte"
  import GamePage from "./pages/GamePage/GamePage.svelte"
  import PostGamePage from "./pages/PostGamePage/PostGamePage.svelte"
  import ProfilePage from "./pages/ProfilePage/ProfilePage.svelte"
  import Header from "./components/header/header.svelte"
  import { fade } from "svelte/transition"

  onMount(() => {
    //Functions to run on startup of App.
    onAppMount()
  })

  const routes = {
    home: "/",
    play: "/play",
    profile: "/profile",
    game: "/play/game/:id",
    end: "/play/game/end",
  }
</script>

{#if $pageHasHeader}
  <Header />
{/if}

<body>
  <Router>
    <Route path={routes.home}><LandingPage /></Route>
    <Route path={routes.play}><PlayPage /></Route>
    <Route path={routes.game} let:params><GamePage gameIdParam={params.id} /></Route>
    <Route path={routes.end}><PostGamePage /></Route>
    <Route path={routes.profile}><ProfilePage /></Route>
  </Router>
</body>

<script lang="ts">
  import { Router, Route } from "svelte-routing"
  import { onMount } from "svelte"

  //Helpers
  import { onAppMount } from "./helpers/onAppMount"

  //Components
  import LandingPage from "./pages/LandingPage/LandingPage.svelte"
  import GamePage from "./pages/GamePage/GamePage.svelte"
  import ProfilePage from "./pages/ProfilePage/ProfilePage.svelte"
  import Header from "./components/header/header.svelte"

  onMount(() => {
    //Functions to run on startup of App.
    onAppMount()
  })
</script>

<style>
</style>

<body>
  <Header />
  <Router>
    <Route path="/"><LandingPage /></Route>
    <Route path="/play"><GamePage /></Route>
    <Route path="/profile"><ProfilePage /></Route>
  </Router>
</body>

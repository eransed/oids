<script lang="ts">
  import { Router, Route } from "svelte-routing"
  import { onMount } from "svelte"

  //Components
  import LandingPage from "./pages/LandingPage.svelte"
  import GamePage from "./pages/GamePage.svelte"
  import ProfilePage from "./pages/ProfilePage.svelte"
  import Header from "./components/header.svelte"

  //Services
  import { validateToken } from "./lib/services/utils/Token"

  //Validate user token from localstorage
  onMount(() => {
    validateToken()
  })
</script>

<style>
</style>

<body>
  <Header />
  <Router>
    <Route path="/" component={LandingPage} />
    <Route path="/play" component={GamePage} />
    <Route path="/profile" component={ProfilePage} />
  </Router>
</body>

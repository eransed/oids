<script lang="ts">
    
    import { Router, Route } from "svelte-routing";

    //Components
    import LandingPage from './components/LandingPage.svelte'
    import PlayPage from "./components/PlayPage.svelte";
    import ProfilePage from "./components/ProfilePage.svelte";
    import Header from "./components/header.svelte";


</script>

<style>

</style>

<body>
  <Header/>
  <Router>
    <Route path='/' component={LandingPage} />
    <Route path='/play' component={PlayPage} />
    <Route path='/profile' component={ProfilePage} />

  </Router>
</body>

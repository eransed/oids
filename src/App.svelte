<script lang="ts">
  //Helpers
  import { onAppMount } from './utils/onAppMount'

  //Components
  import Page from './components/page/page.svelte'
  import CircularSpinner from './components/loaders/circularSpinner.svelte'
  import Routes from './Routes.svelte'
  import Star from './components/animations/star.svelte'
  import Alert from './components/alert/Alert.svelte'
  // import Cursor from './components/mouse/cursor.svelte'
</script>

<Alert />
<!-- <Cursor /> -->
<Star nrOfMoons={1} maxNrOfAsteroids={3} />
{#await onAppMount()}
  <Page>
    <CircularSpinner ship />
  </Page>
{:then}
  <Routes />
{:catch}
  <Routes />
{/await}

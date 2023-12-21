<script lang="ts">
  //Helpers
  import { onAppMount } from './utils/onAppMount'

  //Components
  import Page from './components/page/page.svelte'
  import CircularSpinner from './components/loaders/circularSpinner.svelte'
  import Routes from './Routes.svelte'
  import Star from './components/animations/star.svelte'
  import { socketStore } from './stores/stores'

  $socketStore.connect().then(() => {
    console.log(`Connected to websocket`)
    $socketStore.sendString('Hey from Frontend!')

    setInterval(() => {
      $socketStore.sendString('Hey from Frontend!')
    }, 1000)

    $socketStore.addSimpleListener((d) => {
      console.log(d)
    })
    // hostSession()
  })

  // import Cursor from './components/mouse/cursor.svelte'
</script>

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

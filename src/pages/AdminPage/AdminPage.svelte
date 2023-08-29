<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'

  console.log($user)
</script>

{#if $user.role === 'player'}
  <Page>
    <h1>Admin Page</h1>
  </Page>
{/if}

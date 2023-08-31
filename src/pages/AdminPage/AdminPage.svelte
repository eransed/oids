<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'
</script>

{#if $user}
  {#if $user.role === 'admin'}
    <Page>
      <h1>Admin Page</h1>

      <div class="dataTable">
        <table>
          <tr>
            <th>User</th>
            <th>User</th>
          </tr>
        </table>
      </div>
    </Page>
  {/if}
{/if}

<style>
  .dataTable {
    width: 100%;
    justify-content: center;
    display: flex;
  }

  .dataTable table {
    width: 80%;
  }
</style>

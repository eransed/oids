<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'
  import Card from '../../components/card/card.svelte'

  import userList from '../../lib/services/user/userList'

  //Interfaces
  import type { User } from '../../interfaces/user'

  async function getUsers(): Promise<User[]> {
    return await userList()
      .then((v) => {
        return v.data
      })
      .catch((err) => {
        return err
      })
  }

  let editUser: User | undefined = undefined
</script>

{#if $user}
  {#if $user.role === 'admin'}
    <Page>
      <div class="dataTable">
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
          {#await getUsers() then user}
            {#each Object.values(user) as u}
              {#if editUser && u.id === editUser.id}
                <tr>
                  <td><input value={u.name} /></td>
                  <td><input value={u.email} /></td>
                  <td><input value={u.role} /></td>
                  <td><button on:click={() => (editUser = undefined)}>Cancel</button></td>
                  <td><button on:click={() => console.log('save')}>Save</button></td>
                </tr>
              {:else}
                <tr>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><button on:click={() => (editUser = u)}>Edit</button></td>
                </tr>
              {/if}
            {/each}
          {/await}
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
    width: 50%;
    text-align: left;
  }
</style>

<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'

  //Services
  import updateUser from '../../lib/services/user/updateUser'
  import userList from '../../lib/services/user/userList'

  //Interfaces
  import type { User } from '../../interfaces/user'
  import getProfile from '../../lib/services/user/profile'
  import Alert from '../../components/alert/Alert.svelte'
  import type { AlertType } from '../../components/alert/AlertType'

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

  let name = ''
  let email = ''
  let role = 'guest'
  let roleOptions = ['admin', 'player', 'guest']
  let error: AlertType | undefined = undefined

  async function sendUpdateUser(u: User) {
    console.log('updateUser')
    await updateUser(u)
      .then((res) => {
        if (res.status === 200) {
          editUser = undefined
          if ($user.id === u.id) {
            getProfile()
          }
        } else {
          console.log(res.statusText)
          error = {
            severity: 'error',
            text: 'Could not save!',
          }
          setTimeout(() => {
            error = undefined
          }, 2000)
        }
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
</script>

{#if error}
  <Alert severity={error.severity}>{error.text}</Alert>
{/if}

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
                  <td><input bind:value={name} /></td>
                  <td><input bind:value={email} /></td>
                  <td>
                    <select bind:value={role}>
                      {#each roleOptions as value}
                        <option {value}>{value}</option>
                      {/each}
                    </select>
                  </td>
                  <td><button on:click={() => (editUser = undefined)}>Cancel</button></td>
                  <td>
                    <button
                      on:click={() => {
                        if (editUser) {
                          editUser.name = name
                          editUser.email = email
                          editUser.role = role
                          sendUpdateUser(editUser)
                        }
                      }}>Save</button
                    ></td
                  >
                </tr>
              {:else}
                <tr>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td
                    ><button
                      on:click={() => {
                        editUser = u
                        name = u.name
                        email = u.email
                        role = u.role
                      }}>Edit</button
                    ></td
                  >
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

  .dataTable input {
    width: fit-content;
  }
</style>

<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'

  //Services
  import updateUser from '../../lib/services/user/updateUser'
  import userList from '../../lib/services/user/userList'
  import register from '../../lib/services/auth/register'

  //Interfaces
  import type { User } from '../../interfaces/user'
  import getProfile from '../../lib/services/user/profile'
  import Alert from '../../components/alert/Alert.svelte'
  import type { AlertType } from '../../components/alert/AlertType'
  import type { AxiosError } from 'axios'
  import axios from 'axios'

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
  let alert: AlertType | undefined = undefined
  let addNewUser = false

  let newUser = {
    name: '',
    email: '',
    password: '',
  }

  async function sendUpdateUser(editedUser: User) {
    await updateUser(editedUser)
      .then((res) => {
        if (res.status === 200) {
          alert = {
            severity: 'success',
            text: `User updated successfully to ${editedUser.name}, ${editedUser.email}, ${editedUser.role} `,
          }
          editUser = undefined
          if ($user.id === editedUser.id) {
            getProfile()
          }
        } else {
          alert = {
            severity: 'error',
            text: 'Could not save!',
          }
        }
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  async function addUser() {
    await register(newUser.email, newUser.name, newUser.password)
      .then((res) => {
        if (res.status === 200) {
          alert = {
            severity: 'success',
            text: `New user ${newUser.name} added!`,
          }
          addNewUser = false
          getUsers()
        } else {
          const error = res
          if (axios.isAxiosError(error)) {
            alert = {
              severity: 'warning',
              text: `Could not save: ${error.response?.data}`,
            }
          }
        }
      })
      .catch((error: AxiosError) => {
        alert = {
          severity: 'warning',
          text: `Could not save: ${error.response?.data}`,
        }
      })
  }
</script>

{#if alert}
  <Alert severity={alert.severity} text={alert.text} />
{/if}

{#if $user}
  {#if $user.role === 'admin'}
    <Page>
      <div class="actions">
        <button on:click={() => (addNewUser = true)}>Add user</button>
      </div>
      {#if addNewUser}
        <div class="addUser">
          <input bind:value={newUser.name} placeholder="Name" />
          <input bind:value={newUser.email} placeholder="Email" />
          <input bind:value={newUser.password} placeholder="Password" />
          <button on:click={() => (addNewUser = false)}>Cancel</button>
          <button on:click={() => addUser()}>Save</button>
        </div>
      {/if}

      <div class="dataTable">
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
          {#await getUsers() then userList}
            {#each Object.values(userList) as u}
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
  .actions {
    display: flex;
    width: 100%;
    justify-content: center;
    margin: 1em;
  }

  .addUser {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .addUser input {
    margin: 0.2em;
    padding: 0.2em;
  }

  button {
    margin: 0.2em;
    padding: 0.2em;
  }

  input {
    margin: 0.2em;
    padding: 0.2em;
  }
  .dataTable {
    width: 100%;
    justify-content: center;
    display: flex;
    margin: 1em;
  }

  .dataTable table {
    width: 50%;
    text-align: left;
  }

  .dataTable input {
    width: fit-content;
  }
</style>

<script lang="ts">
  //Stores
  import { user } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'
  import Alert from '../../components/alert/Alert.svelte'

  //Services
  import updateUser from '../../lib/services/user/updateUser'
  import userList from '../../lib/services/user/userList'
  import register from '../../lib/services/auth/register'
  import getProfile from '../../lib/services/user/profile'
  import axios from 'axios'
  import type { AxiosError } from 'axios'

  //Svelte
  import { onMount } from 'svelte'

  //Interfaces
  import type { User } from '../../interfaces/user'
  import type { AlertType } from '../../components/alert/AlertType'
  import { fade } from 'svelte/transition'

  async function getUsers(): Promise<User[]> {
    return await userList()
      .then((v) => {
        return (users = v.data)
      })
      .catch((err) => {
        return err
      })
  }

  onMount(() => {
    getUsers()
  })

  let editingUser: User | undefined = undefined
  let edit: boolean = false

  let name = ''
  let email = ''
  let role = 'guest'
  let roleOptions = ['admin', 'player', 'guest']
  let alert: AlertType | undefined = undefined
  let addNewUser = false
  let users: User[]
  let oldList: User[]

  let newUser = {
    name: '',
    email: '',
    password: '',
  }

  async function sendUpdateUser() {
    const editedUser = editingUser

    if (editedUser) {
      editedUser.name = name
      editedUser.email = email
      editedUser.role = role
      await updateUser(editedUser)
        .then((res) => {
          if (res.status === 200) {
            alert = {
              severity: 'success',
              text: `User updated successfully to ${editedUser.name}, ${editedUser.email}, ${editedUser.role} `,
            }
            editingUser = undefined
            edit = false
            if ($user.id === editedUser.id) {
              getProfile()
            }
          } else {
            const error = res
            console.log(error)
            if (axios.isAxiosError(error)) {
              getUsers()
              alert = {
                severity: 'error',
                text: `${error.response?.data}`,
              }
            }
          }
        })
        .catch((err) => {
          throw new Error(err)
        })
    }
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

  function onKeyPress(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      sendUpdateUser()
    }
  }
</script>

{#if alert}
  <Alert severity={alert.severity} text={alert.text} />
{/if}

{#if $user}
  {#if $user.role === 'admin'}
    <Page>
      <div class="pageWrapper">
        <div class="actions">
          <button on:click={() => (addNewUser = true)}>Add user</button>
        </div>
        {#if addNewUser}
          <div in:fade={{ duration: 250, delay: 50 }} out:fade={{ duration: 250 }} class="addUser">
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
            {#if users}
              {#each Object.values(users) as u}
                {#if edit && u.id === editingUser?.id}
                  <tr>
                    <td><input on:keypress={onKeyPress} bind:value={name} /></td>
                    <td><input on:keypress={onKeyPress} bind:value={email} /></td>
                    <td>
                      <select bind:value={role}>
                        {#each roleOptions as value}
                          <option {value}>{value}</option>
                        {/each}
                      </select>
                    </td>
                    <td
                      ><button
                        on:click={() => {
                          editingUser = undefined
                          edit = false
                        }}>Cancel</button
                      >
                      <button
                        on:click={() => {
                          if (editingUser) {
                            sendUpdateUser()
                          }
                        }}>Save</button
                      >
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td
                      ><button
                        on:click={() => {
                          edit = true
                          editingUser = u
                          name = editingUser.name
                          email = editingUser.email
                          role = editingUser.role
                        }}>Edit</button
                      ></td
                    >
                  </tr>
                {/if}
              {/each}
            {/if}
          </table>
        </div>
      </div>
    </Page>
  {/if}
{/if}

<style>
  .pageWrapper {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    width: 100ch;
  }
  .actions {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 1em;
    flex-flow: row;
    padding: 1em;
  }

  .addUser {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    background-color: var(--main-card-color);
    padding: 1em;
    width: -moz-fit-content;
    width: fit-content;
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
    color: var(--main-text-color);
    justify-content: center;
    display: flex;
    background-color: var(--main-card-color);
    border-radius: 0.5em;
    margin-top: 1em;
    width: 100%;
  }

  .dataTable table tr:nth-child(even) {
    background-color: var(--main-card-color);
  }

  .dataTable table {
    width: 100%;
    text-align: left;
    border-radius: 0.8em;
    padding: 1em;
  }

  .dataTable input {
    width: -moz-fit-content;
    width: fit-content;
  }

  @media screen and (max-width: 600px) {
    .dataTable {
      overflow-x: auto;
    }
  }
</style>

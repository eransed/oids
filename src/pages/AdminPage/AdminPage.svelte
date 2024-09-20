<script lang="ts">
  //Stores
  import { userStore } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'
  import Alert from '../../components/alert/Alert.svelte'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import Button90 from '../../components/menu/Button90.svelte'

  import updateUser from '../../lib/services/user/updateUser'
  import userList from '../../lib/services/user/userList'
  import register from '../../lib/services/auth/register'
  import { getProfile } from '../../lib/services/user/profile'
  import axios from 'axios'
  import type { AxiosError } from 'axios'

  //Svelte
  import { onMount } from 'svelte'

  //Interfaces
  // import type { Prisma, User } from '@prisma/client'
  import type { AlertType } from '../../components/alert/AlertType'
  import { fade } from 'svelte/transition'
  import { deleteUser } from '../../lib/services/user/delete'

  //Icons
  import { Icons } from '../../style/icons'

  //Themes
  import { getThemeNumber } from '../../style/defaultColors'
  import type { Theme, User } from '../../lib/interface'
  import UserList from './components/UserList.svelte'

  async function getUsers(): Promise<User[]> {
    loading = true
    return await userList()
      .then((v) => {
        loading = false
        users = v.data
      })
      .catch((err) => {
        return err
      })
  }

  onMount(async () => {
    await getUsers()
  })

  let editingUser: User | undefined = undefined
  let edit: boolean = false

  let name = ''
  let email = ''
  let role = 'guest'
  let alert: AlertType | undefined = undefined
  let addNewUser = false
  let users: User[] = []
  let loading = false

  let chosenTheme: Theme

  let newUser = {
    name: '',
    email: '',
    password: '',
  }

  async function sendUpdateUser() {
    loading = true

    const editedUser = editingUser

    if (editedUser) {
      const theme = getThemeNumber(chosenTheme)

      console.log(theme)

      editedUser.name = name
      editedUser.email = email
      editedUser.role = role
      editedUser.theme = theme
      await updateUser(editedUser)
        .then((res) => {
          if (res.status === 200) {
            loading = false
            alert = {
              severity: 'success',
              text: `User updated successfully to ${editedUser.name}, ${editedUser.email}, ${editedUser.role} `,
            }
            editingUser = undefined
            edit = false
            if ($userStore && $userStore.id === editedUser.id) {
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
        .catch((err: AxiosError) => {
          loading = false
          alert = {
            severity: 'error',
            text: err.message,
          }
          throw new Error(err.message)
        })
    }
  }

  async function addUser() {
    loading = true
    await register(newUser.email, newUser.name, newUser.password)
      .then((res) => {
        if (res.status === 200) {
          loading = false

          alert = {
            severity: 'success',
            text: `New user ${newUser.name} added!`,
          }
          addNewUser = false
          getUsers()
        } else {
          loading = false
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
        loading = false
        alert = {
          severity: 'warning',
          text: `Could not save: ${error.response?.data}`,
        }
      })
  }

  async function delUser() {
    const result = confirm(`Want to delete user: ${editingUser?.name}?`)
    if (result) {
      const prompt = window.prompt(`Write ${editingUser?.name} in the box to delete user.`)
      if (prompt === name) {
        loading = true

        if (editingUser) {
          await deleteUser(editingUser.email)
            .then((res) => {
              if (res.status === 200) {
                editingUser = undefined
                loading = false
                console.log(res)
                alert = {
                  severity: 'success',
                  text: `${res.data.name} deleted!`,
                }
                getUsers()
              } else {
                loading = false
                const error = res
                if (axios.isAxiosError(error)) {
                  alert = {
                    severity: 'warning',
                    text: `Could not delete user: ${error.response?.data}`,
                  }
                }
              }
            })
            .catch((err) => {
              loading = false
              throw new Error(err)
            })
        }
      }
    }
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

{#if $userStore}
  {#if $userStore.role === 'admin'}
    <Page>
      <div class="pageWrapper">
        <div class="actions">
          <Button90
            addInfo="Add User"
            disabled={loading}
            icon={Icons.AddUser}
            mouseTracking={false}
            buttonConfig={{
              buttonText: 'Add User',
              clickCallback: () => {
                addNewUser = true
              },
              selected: false,
            }}
          />
        </div>
        {#if addNewUser}
          <div in:fade={{ duration: 250, delay: 50 }} out:fade={{ duration: 250 }} class="addUser">
            <input disabled={loading} bind:value={newUser.name} placeholder="Name" />
            <input disabled={loading} bind:value={newUser.email} placeholder="Email" />
            <input disabled={loading} bind:value={newUser.password} placeholder="Password" />
            <Button90
              disabled={loading}
              icon={Icons.Cancel}
              mouseTracking={false}
              buttonConfig={{
                buttonText: 'Cancel',
                clickCallback: () => {
                  addNewUser = false
                },
                selected: false,
              }}
            />
            <Button90
              disabled={loading}
              icon={Icons.Save}
              mouseTracking={false}
              buttonConfig={{
                buttonText: 'Save',
                clickCallback: () => {
                  addUser()
                },
                selected: false,
              }}
            />
          </div>
        {/if}

        {#if users && !loading}
          <UserList {chosenTheme} delUser={() => delUser()} sendUpdateUser={() => sendUpdateUser()} {edit} {users} {loading} {name} {email} {role} {editingUser} onKeyPress={(e) => onKeyPress(e)} />
        {:else}
          <CircularSpinner />
        {/if}
      </div>
    </Page>
  {/if}
{:else}
  <CircularSpinner />
{/if}

<style>
  .pageWrapper {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    width: 100ch;
  }

  .addUser input {
    background-color: var(--main-bg-color);
    outline: none;
    border: none;
    border-top-right-radius: 1em;
    border-top-left-radius: 1em;
    border-bottom: 1px solid var(--main-accent-color);
    padding: 1em;
    color: var(--main-text-color);
    margin: 0.5em;
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
</style>

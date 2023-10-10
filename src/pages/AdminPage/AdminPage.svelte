<script lang="ts">
  //Stores
  import { user, userIncludes } from '../../stores/stores'

  //Components
  import Page from '../../components/page/page.svelte'
  import Alert from '../../components/alert/Alert.svelte'
  import CircularSpinner from '../../components/loaders/circularSpinner.svelte'
  import Button90 from '../../components/menu/Button90.svelte'

  import updateUser from '../../lib/services/user/updateUser'
  import userList from '../../lib/services/user/userList'
  import register from '../../lib/services/auth/register'
  import getProfile from '../../lib/services/user/profile'
  import axios from 'axios'
  import type { AxiosError, AxiosResponse } from 'axios'

  //Svelte
  import { onMount } from 'svelte'

  //Interfaces
  import type { Prisma, User } from '@prisma/client'
  import type { AlertType } from '../../components/alert/AlertType'
  import { fade } from 'svelte/transition'
  import { deleteUser } from '../../lib/services/user/delete'

  //Icons
  import { Icons } from '../../style/icons'

  //Themes
  import { getThemeNumber, themes } from '../../style/defaultColors'
  import type { Theme } from '../../style/styleInterfaces'

  async function getUsers(): Promise<User & Prisma.UserGetPayload<typeof userIncludes>[]> {
    loading = true
    return await userList()
      .then((v) => {
        loading = false
        return (users = v.data)
      })
      .catch((err) => {
        return err
      })
  }

  onMount(() => {
    getUsers()
  })

  let editingUser: (User & Prisma.UserGetPayload<typeof userIncludes>) | undefined = undefined
  let edit: boolean = false

  let name = ''
  let email = ''
  let role = 'guest'
  let roleOptions = ['admin', 'player', 'guest']
  let alert: AlertType | undefined = undefined
  let addNewUser = false
  let users: (User & Prisma.UserGetPayload<typeof userIncludes>)[] = []
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

{#if $user}
  {#if $user.role === 'admin'}
    <Page>
      <div class="pageWrapper">
        <div class="actions">
          <Button90
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
          <div class="dataTable">
            <table>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Theme</th>
              </tr>
              {#each Object.values(users) as u}
                {#if edit && u.id === editingUser?.id}
                  <tr>
                    <td><input disabled={loading} on:keypress={onKeyPress} bind:value={name} /></td>
                    <td><input disabled={loading} on:keypress={onKeyPress} bind:value={email} /></td>
                    <td>
                      <select disabled={loading} bind:value={role}>
                        {#each roleOptions as value}
                          <option {value}>{value}</option>
                        {/each}
                      </select>
                    </td>
                    <td>
                      <select disabled={loading} bind:value={chosenTheme}>
                        {#each themes as value}
                          <option {value}>{value.name}</option>
                        {/each}
                      </select>
                    </td>
                    <td>
                      <Button90
                        disabled={loading}
                        icon={Icons.Cancel}
                        mouseTracking={false}
                        buttonConfig={{
                          buttonText: 'Cancel',
                          clickCallback: () => {
                            editingUser = undefined
                            edit = false
                          },
                          selected: false,
                        }}
                      />
                    </td>
                    <td>
                      <Button90
                        disabled={loading}
                        icon={Icons.Save}
                        mouseTracking={false}
                        buttonConfig={{
                          buttonText: 'Save',
                          clickCallback: () => {
                            if (editingUser) {
                              sendUpdateUser()
                            }
                          },
                          selected: false,
                        }}
                      />
                    </td>
                    <td>
                      <Button90
                        disabled={loading}
                        icon={Icons.Delete}
                        mouseTracking={false}
                        buttonConfig={{
                          buttonText: 'Delete User',
                          clickCallback: () => {
                            delUser()
                          },
                          selected: false,
                        }}
                      />
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{themes[u.theme].name}</td>

                    <td>
                      <Button90
                        disabled={loading}
                        icon={Icons.EditUser}
                        mouseTracking={false}
                        buttonConfig={{
                          buttonText: 'Edit User',
                          clickCallback: () => {
                            edit = true
                            editingUser = u

                            name = editingUser.name
                            email = editingUser.email
                            role = editingUser.role
                            chosenTheme = themes[editingUser.theme]
                          },
                          selected: false,
                        }}
                      />
                    </td>
                  </tr>
                {/if}
              {/each}
            </table>
          </div>
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

  .pageWrapper input,
  .pageWrapper select,
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

  button {
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

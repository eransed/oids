<script lang="ts">
  import Button90 from '../../../components/menu/Button90.svelte'
  import type { Theme, User } from '../../../lib/interface'
  import { themes } from '../../../style/defaultColors'
  import { Icons } from '../../../style/icons'

  export let edit: boolean
  export let users: User[]
  export let name: string
  export let email: string
  export let role: string
  export let onKeyPress: (e: KeyboardEvent) => void
  export let sendUpdateUser: () => void
  export let delUser: () => void
  export let loading: boolean
  export let editingUser: User | undefined
  export let chosenTheme: Theme

  let roleOptions = ['admin', 'player', 'guest']
</script>

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
          <td
            ><input
              disabled={loading}
              on:keypress={onKeyPress}
              bind:value={name}
            /></td
          >
          <td
            ><input
              disabled={loading}
              on:keypress={onKeyPress}
              bind:value={email}
            /></td
          >
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
              addInfo="Cancel"
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
              addInfo="Save changes"
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
              addInfo="Delete User"
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
              addInfo="Edit user"
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

<style>
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
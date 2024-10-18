<script lang="ts">
  //Components
  import Button90 from '../menu/Button90.svelte'

  //navButtons
  import { logOutButton, loginButton, loginGoogle } from './profileButtons'

  //Stores
  import { userStore } from '../../stores/stores'

  //Svelte
  import { fade } from 'svelte/transition'

  //Services
  import login from '../../lib/services/auth/login'
  import { getProfile } from '../../lib/services/user/profile'

  //Assets
  import { navigate } from 'svelte-routing'
  import { Icons } from '../../style/icons'
  import { addAlert } from '../alert/alertHandler'
  import { handleAxiosError } from '../../lib/services/utils/errorHandler'

  let loading: boolean = false

  const handleSubmit = async (e: Event): Promise<void> => {
    loading = true
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    if (email && password) {
      try {
        const response = await login(email, password)
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        await getProfile()
        loading = false
      } catch (e) {
        handleAxiosError(e)
        loading = false
      }
    }
  }

  //Color of border color around profile portrait
  $: borderColor = $userStore ? 'rgb(144, 238, 144)' : 'rgb(255, 165, 0)'
</script>

{#if !$userStore}
  <div class="profileModal" in:fade={{ duration: 600, delay: 150 }}>
    <form on:submit|preventDefault={handleSubmit} on:formdata class="form">
      <input placeholder="Email" name="email" type="email" autocomplete="email" />

      <input placeholder="Password" name="password" type="password" autocomplete="current-password" />
      <div class="button">
        <Button90 addInfo="Login" icon={Icons.Login} buttonType="submit" {loading} buttonConfig={loginButton} />
      </div>
      <div class="button google">
        <Button90 buttonType="button" buttonConfig={loginGoogle} socialIcon={Icons.Google} addInfo="Login with Google" />
      </div>
    </form>
  </div>
{/if}
{#if $userStore}
  <div class="profileModal" in:fade={{ duration: 600, delay: 150 }}>
    <div class="row1">
      <div class="column" style={'flex: 0.5;'}>
        <div class="modalProfile" style="--borderColor: {borderColor};">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img on:click={() => navigate('/profile')} draggable="false" class="avatar" src={$userStore.image} alt="Rocket Ship" />
        </div>
      </div>
      <div class="column">
        <div class="profileName">
          {$userStore?.name}
        </div>
      </div>
    </div>
    <div class="row2">
      <div class="column">
        <div>
          <p style="margin-top: 0.5em;">Email: {$userStore?.email}</p>

          <p>
            Created: {$userStore && new Intl.DateTimeFormat('en-SE').format(new Date($userStore.createdAt))}
          </p>
        </div>
      </div>
    </div>

    <div class="button">
      <Button90 icon={Icons.Logout} addInfo="Logout" buttonConfig={logOutButton} mouseTracking={false} />
    </div>
  </div>
{/if}

<style>
  .profileModal {
    display: flex;
    flex-direction: column;
    width: 100%;
    /* margin: 0.85em; */
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    justify-items: center;
    padding: 1em;
  }

  /* form {
    display: grid;
    justify-content: center;
    align-items: center;
  } */

  .row1 {
    display: flex;
    grid-template-columns: 1fr 4fr;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .row2 {
    display: flex;
    grid-template-columns: 1fr;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .column {
    text-align: left;
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
    justify-content: center;
  }

  .column p {
    padding-left: 0.6em;
  }
  .button {
    width: -moz-fit-content;
    width: fit-content;
    justify-self: center;
    margin-top: 10px;
  }

  .google {
    border-top: 1px solid var(--main-accent-color);
  }

  input {
    /* Need to set font-size to 16px and above to disable autozoom on mobile devices */
    font-size: 16px;
  }
</style>

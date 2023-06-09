<script lang="ts">
  //Components
  import Button90 from "../menu/Button90.svelte"

  //navButtons
  import { logOutButton, loginButton } from "./profileButtons"

  //Stores
  import { isLoggedIn, userLoading, user } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //Svelte
  import { fade } from "svelte/transition"

  //Services
  import login from "../../lib/services/auth/login"
  import getProfile from "../../lib/services/user/profile"

  //Assets
  import Avatar from "../../assets/avatar.png"

  let errorText: any = ""
  let wrongPassword: boolean = false
  let profile: User | undefined
  let loading: boolean

  let loggedIn = false

  isLoggedIn.subscribe((value) => {
    loggedIn = value
  })

  userLoading.subscribe((value) => {
    loading = value
  })

  user.subscribe((value) => {
    profile = value
  })

  const handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const response = await login(formData)
    if (response.status === 200) {
      errorText = ""
      await getProfile()
    } else {
      wrongPassword = true
      errorText = "Wrong email or password, try again!"
    }
  }

  //Color of border color around profile portrait
  $: borderColor = loggedIn ? "rgb(144, 238, 144)" : "rgb(255, 165, 0)"
</script>

<style>
  .profileModal {
    display: grid;
    flex-direction: column;
    width: 100%;
    margin: 0.85em;
  }

  .row1 {
    display: grid;
    grid-template-columns: 1fr 4fr;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .row2 {
    display: grid;
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
    width: fit-content;
    justify-self: center;
    margin-top: 10px;
  }

  input {
    /* Need to set font-size to 16px and above to disable autozoom on mobile devices */
    font-size: 16px;
  }
</style>

{#if !loggedIn}
  <div class="profileModal" in:fade={{ duration: 600, delay: 150 }}>
    <form on:submit|preventDefault={handleSubmit} on:formdata class="form">
      <input placeholder="Email" name="email" type="email" autocomplete="email" />

      <input placeholder="Password" name="password" type="password" autocomplete="current-password" style="border: {wrongPassword && '2px solid red'}" />
      <div class="button">
        <Button90 buttonConfig={loginButton} mouseTracking={false} />
      </div>
    </form>
  </div>
{/if}
{#if loggedIn}
  <div class="profileModal" in:fade={{ duration: 600, delay: 150 }}>
    <div class="row1">
      <div class="column" style={"flex: 0.5;"}>
        <div class="modalProfile" style="--borderColor: {borderColor};">
          <img class="avatar" src={Avatar} alt="Avatar" />
        </div>
      </div>
      <div class="column">
        <div class="profileName">
          {profile?.name}
        </div>
      </div>
    </div>
    <div class="row2">
      <div class="column">
        <div>
          <p style="margin-top: 0.5em;">Email: {profile?.email}</p>
          <p>
            Created: {profile && new Intl.DateTimeFormat("en-SE").format(new Date(profile.createdAt))}
          </p>
        </div>
      </div>
    </div>
    <div class="button">
      <Button90 buttonConfig={logOutButton} mouseTracking={false} />
    </div>
  </div>
{/if}

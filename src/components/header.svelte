<script lang="ts">
  import { isLoggedIn } from "../lib/stores"

  //Avatar imgs
  import Avatar from "../assets/avatar.png"
  import Modal from "./shared/Modal.svelte"

  //Services
  import login from "../lib/services/auth/login"
  import getProfile from "../lib/services/user/profile"

  //Stores
  import { user } from "../lib/stores"

  //Interfaces
  import type { User } from "./interface"

  let showModal: boolean | undefined = false
  let errorText: any = ""
  let wrongPassword: boolean = false
  let profile: User | undefined
  user.subscribe((value) => {
    profile = value
  })

  let loggedIn = false
  isLoggedIn.subscribe((value) => {
    loggedIn = value
  })

  const handleClickProfile = () => {
    showModal = true
  }

  const handleSubmit = async (e: Event) => {
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

  $: borderColor = loggedIn ? "rgb(144, 238, 144)" : "rgb(255, 165, 0)"
</script>

<style>
  .header {
    position: fixed;
    top: 1em;
    width: 98%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    color: #000;
    z-index: 1;
  }

  .profile {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    border-radius: 50%;
    border-width: 0.2em;
    border-style: solid;
  }

  .avatar {
    height: 100%;
  }
</style>

<div class="header">
  <div
    class="profile"
    style="border-color: {borderColor}"
    on:mousedown={handleClickProfile}
  >
    <img class="avatar" src={Avatar} alt="Avatar" />
  </div>
  <Modal
    title={loggedIn ? "Profile" : "Log in"}
    {showModal}
    closedCallback={() => {
      showModal = false
    }}
  >
    {#if !loggedIn}
      <form on:submit={handleSubmit} on:formdata>
        <label>
          Email
          <input name="email" type="email" autocomplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autocomplete="current-password"
            style="border: {wrongPassword && '2px solid red'}"
          />
        </label>
        <button>Log in</button>
      </form>
      <h6>{errorText}</h6>
    {/if}
    {#if loggedIn}
      <h4>Welcome {profile?.name}</h4>

      <p style="margin-top: 0.5em;">Email: {profile?.email}</p>
      <p>
        Created: {profile &&
          new Intl.DateTimeFormat("en-SE").format(new Date(profile.createdAt))}
      </p>
    {/if}
  </Modal>
</div>

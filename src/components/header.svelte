<script lang="ts">
  import { isLoggedIn } from "../lib/stores"

  //Avatar imgs
  import Avatar from "../assets/avatar.png"
  import Modal from "./shared/Modal.svelte"

  //Services
  import login from "../lib/services/auth/login"
  import getProfile from "../lib/services/user/profile"

  //Stores
  import { user, userLoading } from "../lib/stores"

  //Interfaces
  import type { User } from "./interface"

  let showModal: boolean | undefined = false
  let errorText: any = ""
  let wrongPassword: boolean = false
  let profile: User | undefined
  let loading: boolean

  userLoading.subscribe((value) => {
    loading = value
  })

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
  :root {
    --borderColor: rgb(255, 165, 0);
    --borderSize: 3px;
    --borderStyle: solid;
  }

  .header {
    position: fixed;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    color: #000;
    z-index: 1;
  }

  .profile {
    height: 50px;
    width: 50px;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    cursor: pointer;
    border-radius: 100%;
    border-style: solid;
    border-width: 3px;
    border-color: var(--borderColor);
    transition: var(--borderColor);
    transition-duration: 3s;
    transition-delay: 0.5s;
  }

  .profile::after {
    display: block;
    background-color: red;
    position: absolute;
    height: 100px;
    content: "";
  }

  .avatar {
    height: 100%;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
  }

  .form input {
    width: 50%;
    padding: 8px;
    margin: 8px;
  }
</style>

<div class="header">
  <div
    class="profile"
    style="--borderColor: {borderColor};"
    on:mousedown={handleClickProfile}
  >
    <img class="avatar" src={Avatar} alt="Avatar" />
  </div>
  {#if showModal}
    <Modal
      backDrop={false}
      title={loggedIn ? "Profile" : "Log in"}
      {showModal}
      closedCallback={() => {
        showModal = false
      }}
    >
      {#if !loggedIn}
        <form on:submit={handleSubmit} on:formdata class="form">
          <input
            placeholder="Email"
            name="email"
            type="email"
            autocomplete="email"
          />

          <input
            placeholder="Password"
            name="password"
            type="password"
            autocomplete="current-password"
            style="border: {wrongPassword && '2px solid red'}"
          />

          <button>Log in</button>
        </form>
      {/if}
      {#if loggedIn}
        <h4>Welcome {profile?.name}</h4>

        <p style="margin-top: 0.5em;">Email: {profile?.email}</p>
        <p>
          Created: {profile &&
            new Intl.DateTimeFormat("en-SE").format(
              new Date(profile.createdAt)
            )}
        </p>
      {/if}
    </Modal>
  {/if}
</div>

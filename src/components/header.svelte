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

  const handleLogout = () => {
    localStorage.clear()
    isLoggedIn.set(false)
    user.set(undefined)
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
    flex-direction: row;
    justify-content: flex-end;
    flex-wrap: wrap;
    color: #fff;
    z-index: 1;
    padding-left: calc(100vw);
    transition: all;
    transition-duration: 1s;
  }

  .header:first-child::before {
    opacity: 0.35;
    content: "";
    font-size: 3em;
    /* border-left: 2px solid cadetblue; */
    position: absolute;
    width: 0.8em;
    height: 0.2em;
    right: 0px;
    margin-right: 102vw;
    margin-top: 0.65em;
    transition: all;
    transition-duration: 1s;
    border-top: 4px solid rgb(47, 167, 252);
    border-bottom: 4px solid rgb(47, 167, 252);
    transform: rotate(0deg);
    transition-delay: 0.1s;
    cursor: pointer;
  }

  .header:hover:first-child::before {
    opacity: 0;
    content: "";
    font-size: 3em;
    /* border-left: 2px solid cadetblue; */
    position: absolute;
    width: 0.8em;
    height: 0.2em;
    right: 0px;
    margin-right: 0vw;
    margin-top: 0.65em;
    transition: all;
    transition-duration: 1s;
    border-top: 4px solid rgb(47, 167, 252);
    border-bottom: 4px solid rgb(47, 167, 252);
    transform: rotate(0deg);
    transition-delay: 0s;
    cursor: pointer;
  }

  .header:hover {
    padding: 0em;
    transition: padding;
    transition-duration: 1s;
  }

  .header > * {
    opacity: 0.2;
    transition: all;
    transition-duration: 1s;
    margin: 1em;
  }

  .header:hover > * {
    opacity: 0.5;
    transition: all;
    transition-duration: 0.5s;
  }

  .header:hover > *:hover {
    filter: saturate(5);
    opacity: 1;
    margin-top: 1.2em;
    transition: all;
    transition-duration: 0.5s;
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

    transition-property: all;
    transition: 1s;
  }

  .profile :hover {
    opacity: 0.8;
    transition-property: all;
    transition: 1s;
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
    width: 80%;
    padding: 8px;
    margin: 8px;
  }

  .form button {
    width: 85%;
    padding: 7px;
    margin: 8px;
    align-self: center;
    cursor: pointer;
  }
</style>

<div class="header">
  <div class="profile" style="--borderColor: {borderColor};" on:mousedown={handleClickProfile}>
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
          <input placeholder="Email" name="email" type="email" autocomplete="email" />

          <input placeholder="Password" name="password" type="password" autocomplete="current-password" style="border: {wrongPassword && '2px solid red'}" />

          <button>Log in</button>
        </form>
      {/if}
      {#if loggedIn}
        <h4>Welcome {profile?.name}</h4>

        <p style="margin-top: 0.5em;">Email: {profile?.email}</p>
        <p>
          Created: {profile && new Intl.DateTimeFormat("en-SE").format(new Date(profile.createdAt))}
        </p>
        <form on:submit|preventDefault={handleLogout} class="form">
          <button>Log out</button>
        </form>
      {/if}
    </Modal>
  {/if}
</div>

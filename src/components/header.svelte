<script lang="ts">
  import { isLoggedIn } from "../lib/stores"

  //Avatar imgs
  import Avatar from "../assets/avatar.png"
  import Modal from "./shared/Modal.svelte"

  //Services
  import login from "../lib/services/auth/login"
  import getProfile from "../lib/services/user/profile"

  //Stores
  import { user, userLoading, showLoginModal } from "../lib/stores"

  //Interfaces
  import type { Button90Config, User } from "./interface"
  import Button90 from "./shared/menu/Button90.svelte"

  //Svelte fx
  import { fade } from "svelte/transition"

  let showLogin: boolean | undefined = false
  let errorText: any = ""
  let wrongPassword: boolean = false
  let profile: User | undefined
  let loading: boolean

  showLoginModal.subscribe((value) => {
    showLogin = value
  })

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
    showLogin = true
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

  const logOutButton: Button90Config = {
    buttonText: "Log out",
    clickCallback: () => handleLogout(),
    selected: false,
  }

  const loginButton: Button90Config = {
    buttonText: "Log in",
    clickCallback: () => {},
    selected: false,
  }

  $: borderColor = loggedIn ? "rgb(144, 238, 144)" : "rgb(255, 165, 0)"
</script>

<style>
  :root {
    --borderColor: rgb(255, 165, 0);
    --borderSize: 3px;
    --borderStyle: solid;
  }

  .headerWrapper {
    display: flex;
    width: fit-content;
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
  }

  .header {
    position: fixed;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex-wrap: wrap;
    color: #fff;
    overflow: hidden;
    z-index: 2;
    transition: all;
    transition-duration: 0s;
    transition-timing-function: cubic-bezier(1, -1.53, 0.26, 1.1);
  }

  .header > * {
    opacity: 0.2;
    transition: all;
    transition-duration: 0s;
    margin: 1em;
  }

  .header:hover > * {
    opacity: 0.5;
    transition: all;
    transition-duration: 0.5s;
    margin-right: 1em;
  }

  .header:hover > *:hover {
    filter: saturate(5);
    opacity: 1;
    margin-top: 1.2em;
    transition: all;
    transition-duration: 1s;
  }

  .header:first-child::before {
    opacity: 0.35;
    content: "";
    font-size: 3em;
    /* border-left: 2px solid cadetblue; */
    position: fixed;
    width: 0.8em;
    height: 0.2em;
    right: 10px;
    /* margin-right: 102vw; */
    margin-top: 0.65em;
    transition: all;
    transition-duration: 0.8s;
    transition-timing-function: ease;
    border-top: 4px solid rgb(47, 167, 252);
    border-bottom: 4px solid rgb(47, 167, 252);
    transform: rotate(0deg);
    transition-delay: 0.4s;
    cursor: pointer;
  }

  .header:hover:first-child::before {
    margin-right: 0;
    opacity: 0;
    transition: all;
    transition-duration: 0.5s;
    transition-delay: 0.2s;
  }

  .profile,
  .modalProfile {
    height: 50px;
    width: 50px;
    display: flex;
    margin-right: -20vw;
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
    transition-duration: 1s;
    transition-delay: 0.2s;
    transition-property: all;
    transition-timing-function: cubic-bezier(1, -0.53, 0.26, 1.1);
  }

  .modalProfile {
    height: 40px;
    width: 40px;
    top: 0.5em;
    left: 6em;
    cursor: auto;
    filter: saturate(2);
  }

  .modalProfile:hover {
    transition-property: all;
    transition: 0.5s;
    cursor: pointer;
    width: fit-content;
  }

  .profile:hover {
    opacity: 0.8;
    transition-property: all;
    transition: 0.5s;
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

  .row {
    display: flex;
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
</style>

<div class="headerWrapper">
  <div class="header">
    <div class="profile" style="--borderColor: {borderColor};" on:mousedown={handleClickProfile}>
      <img class="avatar" src={Avatar} alt="Avatar" />
    </div>

    {#if showLogin}
      <Modal
        backDrop={false}
        title={loggedIn ? "Profile" : "Log in"}
        showModal={showLogin}
        closedCallback={() => {
          showLogin = false
          showLoginModal.set(false)
        }}
      >
        {#if !loggedIn}
          <div in:fade={{ duration: 600, delay: 150 }}>
            <form on:submit|preventDefault={handleSubmit} on:formdata class="form">
              <input placeholder="Email" name="email" type="email" autocomplete="email" />

              <input
                placeholder="Password"
                name="password"
                type="password"
                autocomplete="current-password"
                style="border: {wrongPassword && '2px solid red'}"
              />

              <Button90 buttonConfig={loginButton} mouseTracking={false} />
            </form>
          </div>
        {/if}
        {#if loggedIn}
          <div in:fade={{ duration: 600, delay: 150 }}>
            <div class="row">
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
            <div class="row">
              <div class="column">
                <div>
                  <p style="margin-top: 0.5em;">Email: {profile?.email}</p>
                  <p>
                    Created: {profile && new Intl.DateTimeFormat("en-SE").format(new Date(profile.createdAt))}
                  </p>
                </div>
              </div>
            </div>

            <Button90 buttonConfig={logOutButton} mouseTracking={false} />
          </div>
        {/if}
      </Modal>
    {/if}
  </div>
</div>

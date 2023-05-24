<script lang="ts">
  //Routes
  import { Router, Link } from "svelte-routing"

  //Avatar imgs
  import Avatar from "../../assets/avatar.png"

  //Components
  import Modal from "../modal/Modal.svelte"
  import Button90 from "../menu/Button90.svelte"

  //Services
  import login from "../../lib/services/auth/login"
  import getProfile from "../../lib/services/user/profile"

  //Stores
  import { user, userLoading, showLoginModal } from "../../stores/stores"
  import { isLoggedIn, showLobby } from "../../stores/stores"

  //Interfaces
  import type { Button90Config } from "../../interfaces/menu"
  import type { User } from "../../interfaces/user"

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

  const Play: Button90Config = {
    buttonText: "Play",
    clickCallback: function (): void {
      console.log("Play button")
    },
    selected: false,
  }

  const Profile: Button90Config = {
    buttonText: "Profile",
    clickCallback: function (): void {
      console.log("Profile button")
    },
    selected: false,
  }
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
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 100%;
  }

  .header {
    top: 0;
    position: fixed;
    display: flex;
    flex-wrap: wrap;
    color: #fff;
    overflow: hidden;
    justify-content: space-between;
    width: 100%;
    max-width: 1500px;
    z-index: 2;
    transition: all;
    transition-duration: 0s;
    transition-timing-function: cubic-bezier(1, -1.53, 0.26, 1.1);
    /* background: linear-gradient(rgba(50, 82, 225, 0.1), rgba(0, 0, 0, 0.4)); */
  }

  .header > * {
    opacity: 0.8;
    transition: all;
    transition-duration: 0s;
    margin: 1em;
  }

  .header:hover > * {
    transition: all;
    transition-duration: 0.5s;
    margin-right: 1em;
  }

  .menuItem,
  .modalProfile {
    height: 50px;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    justify-content: center;
    flex-direction: row;
    align-content: center;
    cursor: pointer;
    border-color: var(--borderColor);
    transition: var(--borderColor);
    transition-duration: 1s;
    transition-delay: 0.2s;
    transition-property: all;
    transition-timing-function: cubic-bezier(1, -0.53, 0.26, 1.1);
  }

  .menuItem {
    width: fit-content;
  }

  .navButtons {
    cursor: default;
    opacity: 1;
    padding: 1em;
    font-weight: bolder;
    color: rgba(255, 255, 255, 0.6);
    transition-property: all;
    transition: 0.6s;
    border-color: rgb(161, 211, 247, 0.5);
  }

  .navButtons:hover {
    opacity: 1;
    transition-property: all;
    color: rgb(255, 255, 255);
    transition: 0.6s;
    /* border-bottom: 1px solid #fff; */
  }

  .modalProfile {
    width: 50px;
    top: 0.5em;
    left: 6em;
    cursor: auto;
    filter: saturate(2);
    border-radius: 100%;
    border-style: solid;
    border-width: 3px;
    border-color: var(--borderColor);
    transition: var(--borderColor);
    transition: all;
    transition-duration: 1s;
  }

  .modalProfile:hover {
    filter: saturate(5);
    opacity: 1;

    transition-property: all;
    transition: 1s;
    cursor: pointer;
    width: fit-content;
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
    <nav>
      <div class="menuItem">
        <div class="navButtons">
          <Router>
            <Link to="play">
              <Button90 mouseTracking={false} buttonConfig={Play} />
            </Link>
          </Router>
        </div>
        <div class="navButtons">
          <Router>
            <Link to="profile">
              <Button90 mouseTracking={false} buttonConfig={Profile} />
            </Link>
          </Router>
        </div>
      </div>
    </nav>

    <div class="modalProfile" style="--borderColor: {borderColor};" on:mousedown={handleClickProfile}>
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

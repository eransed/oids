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
  import { isLoggedIn } from "../../stores/stores"

  //Interfaces
  import type { User } from "../../interfaces/user"

  //navButtons
  import { logOutButton, loginButton, Play, Profile } from "./navButtons"

  //Svelte fx
  import { fade } from "svelte/transition"

  //css
  import "./style.css"

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

  $: borderColor = loggedIn ? "rgb(144, 238, 144)" : "rgb(255, 165, 0)"
</script>

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

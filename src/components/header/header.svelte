<script lang="ts">
  //Routes
  import { Router, Link } from "svelte-routing"

  //Avatar imgs
  import Avatar from "../../assets/avatar.png"

  //Components
  import Button90 from "../menu/Button90.svelte"
  import ProfileModal from "../profile/ProfileModal.svelte"

  //Stores
  import { isLoggedIn } from "../../stores/stores"

  //navButtons
  import { Play, Profile } from "./navButtons"

  //Svelte fx
  import { slide } from "svelte/transition"

  //css
  import "./style.css"
  import Modal from "../modal/Modal.svelte"

  let showLogin: boolean | undefined = false

  let loggedIn = false
  isLoggedIn.subscribe((value) => {
    loggedIn = value
  })

  const handleClickProfile = () => {
    showLogin = !showLogin
  }

  $: borderColor = loggedIn ? "rgb(144, 238, 144)" : "rgb(255, 165, 0)"
</script>

<div class="header">
  <nav>
    <div class="menuItem">
      <div class="navButton">
        <Button90 mouseTracking={false} buttonConfig={Play} />
      </div>
      <div class="navButton profileBtn">
        <Button90 mouseTracking={false} buttonConfig={Profile} />
      </div>
    </div>

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
        }}
      >
        <ProfileModal />
      </Modal>
    {/if}
  </nav>
</div>

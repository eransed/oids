<script lang="ts">
  //Routes
  import { routes } from '../../routes'

  //Avatar imgs
  import Avatar from '../../assets/avatar.png'

  //Components
  import Button90 from '../menu/Button90.svelte'
  import ProfileModal from '../profile/ProfileModal.svelte'

  //Stores
  import { isLoggedIn, user, settings } from '../../stores/stores'

  //css
  import './style.css'
  import Modal from '../modal/Modal.svelte'
  import { navigate } from 'svelte-routing/src/history'

  let showLogin: boolean | undefined = false

  let loggedIn = false
  isLoggedIn.subscribe((value) => {
    loggedIn = value
  })

  const handleClickProfile = () => {
    showLogin = !showLogin
  }

  $: borderColor = loggedIn ? 'rgb(144, 238, 144)' : 'rgb(255, 165, 0)'
</script>

<div class="header">
  <nav>
    <div class="menuItem">
      {#each Object.values(routes) as route}
        {#if route.inHeader}
          {#if route.path === '/admin' && $user && $user.role === 'admin'}
            <div class="navButton">
              <Button90
                mouseTracking={false}
                buttonConfig={{
                  buttonText: route.displayText,
                  clickCallback: () => {
                    navigate(route.path)
                  },
                  selected: false,
                }}
              />
            </div>
          {:else if route.path !== '/admin'}
            <div class="navButton">
              <Button90
                mouseTracking={false}
                buttonConfig={{
                  buttonText: route.displayText,
                  clickCallback: () => {
                    navigate(route.path)
                  },
                  selected: false,
                }}
              />
            </div>
          {/if}
        {/if}
      {/each}
    </div>
    <div class="theme">
      <button on:click={() => ($settings.darkMode = !$settings.darkMode)}>
        {#if $settings.darkMode}
          Dark
        {:else}
          Light
        {/if}
      </button>
    </div>
    <div class="modalProfile" style="--borderColor: {borderColor};" on:mousedown={handleClickProfile}>
      <img class="avatar" src={Avatar} alt="Avatar" />
    </div>

    {#if showLogin}
      <Modal
        backDrop={false}
        title={loggedIn ? 'Profile' : 'Log in'}
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

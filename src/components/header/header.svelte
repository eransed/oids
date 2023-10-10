<script lang="ts">
  //Routes
  import { routes } from '../../routes'

  //Components
  import Button90 from '../menu/Button90.svelte'
  import ProfileModal from '../profile/ProfileModal.svelte'

  //Stores
  import { user, settings, isLoggedIn } from '../../stores/stores'

  //css
  import './style.css'
  import Modal from '../modal/Modal.svelte'
  import { navigate } from 'svelte-routing/src/history'
  import { slide, fade, fly } from 'svelte/transition'
  import { DeepMidnight, toggleAndGetTheme } from '../../style/defaultColors'
  import { Avatars } from '../../style/avatars'

  let showLogin: boolean | undefined = false

  const handleClickProfile = () => {
    showLogin = !showLogin
  }

  $: borderColor = $isLoggedIn ? 'rgb(144, 238, 144)' : 'rgb(255, 165, 0)'

  $: pathname = location.pathname

  let toggleMenu: boolean = false

  $: display = toggleMenu ? 'flex' : 'none'
  $: menuOpen = toggleMenu ? '90deg' : '0deg'

  function themeToggler() {
    const t = toggleAndGetTheme()
    $settings = t
  }
</script>

<div class="header">
  <nav in:slide={{ duration: 500 }}>
    <div class="hamburger" style="--menuOpen: {menuOpen}">
      <button on:click={() => (toggleMenu = !toggleMenu)}>{toggleMenu ? '{ o }' : '{ o }'} </button>
    </div>

    <div in:fade={{ duration: 500, delay: 0 }} out:fade={{ duration: 500, delay: 500 }} class="menuItem" style="--display: {display};">
      {#each Object.values(routes) as route}
        {#if route.inHeader}
          {#if route.path === '/admin' && $user && $user.role === 'admin'}
            <div in:slide={{ duration: 500, delay: 500 }} out:slide={{ duration: 500, delay: 0 }} class="navButton">
              <Button90
                icon={route.icon}
                mouseTracking={false}
                buttonConfig={{
                  buttonText: route.displayText,
                  clickCallback: () => {
                    if (window.innerWidth < 750) {
                      toggleMenu = false
                    }
                    navigate(route.path)
                    pathname = location.pathname
                  },
                  selected: pathname === route.path,
                }}
              />
            </div>
          {:else if route.path !== '/admin'}
            <div in:slide={{ duration: 500, delay: 500 }} out:slide={{ duration: 500, delay: 0 }} class="navButton">
              <Button90
                icon={route.icon}
                mouseTracking={false}
                buttonConfig={{
                  buttonText: route.displayText,
                  clickCallback: () => {
                    if (window.innerWidth <= 750) {
                      toggleMenu = false
                    }
                    navigate(route.path)
                    pathname = location.pathname
                  },
                  selected: pathname === route.path,
                }}
              />
            </div>
          {/if}
        {/if}
      {/each}
    </div>

    <div class="theme">
      <button class="themeToggle" on:click={() => themeToggler()}>
        {#if $settings.theme === DeepMidnight}
          <i in:fade={{ duration: 500, delay: 500 }} out:fly={{ duration: 250, delay: 0 }} class="fa-solid fa-moon fa-2xl" />
        {:else}
          <i in:fade={{ duration: 500, delay: 500 }} out:fly={{ duration: 250, delay: 0 }} class="fa-solid fa-sun fa-2xl" />
        {/if}
      </button>
    </div>
    <div class="modalProfile" style="--borderColor: {borderColor};" on:mousedown={handleClickProfile}>
      <img draggable="false" class="avatar" src={$isLoggedIn ? $user.image : Avatars.AstronautMale} alt="Avatar" />
    </div>

    {#if showLogin}
      <Modal
        backDrop={false}
        title={$user ? 'Profile' : 'Log in'}
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

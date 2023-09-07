<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { guestUser, pageHasHeader, user, isLoggedIn } from '../../stores/stores'

  //Components
  import TypeWriter from '../../components/typeWriter/TypeWriter.svelte'

  pageHasHeader.set(true)

  const welcomeMessage = 'Welcome to OIDS '
</script>

<div out:fade class="landingPage">
  {#if $isLoggedIn && $user}
    <TypeWriter text={welcomeMessage + $user.name} />
  {:else}
    <TypeWriter text={welcomeMessage + $guestUser.name} />
  {/if}
</div>

<style>
  .landingPage {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: var(--main-text-color);
    height: 100vh;
    width: 100vw;
  }
</style>

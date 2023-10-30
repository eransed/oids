<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { guestUser, pageHasHeader, user, isLoggedIn } from '../../stores/stores'

  //Components
  import TypeWriter from '../../components/typeWriter/TypeWriter.svelte'
  import Star from '../../components/animations/star.svelte'

  pageHasHeader.set(true)

  const welcomeMessage = 'Welcome to OIDS '
  let help = false
</script>

<div out:fade class="landingPage">
  {#if $isLoggedIn && $user}
    <TypeWriter text={welcomeMessage + $user.name} />
  {:else}
    <TypeWriter
      text={welcomeMessage + $guestUser.name}
      doneCallback={() => {
        setTimeout(() => {
          help = true
        }, 3000)
      }}
    />
    {#if help}
      <TypeWriter text={'You ready for an adventure?'} />
    {/if}
  {/if}
  <br />
</div>
<Star />
<Star orbitDirectionForward={false} />

<style>
  .landingPage {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: var(--main-text-color);
    height: 100vh;
    width: 100vw;
    flex-direction: column;
    /* border-bottom: 250px dotted var(--main-card-color); */
    /* border-radius: 50%; */
  }
</style>

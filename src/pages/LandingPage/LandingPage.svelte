<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { guestUserStore, pageHasHeaderStore, userStore, isLoggedInStore } from '../../stores/stores'

  //Components
  import TypeWriter from '../../components/typeWriter/TypeWriter.svelte'
  import Star from '../../components/animations/star.svelte'
  import ModalSimple from '../../components/modal/ModalSimple.svelte'

  pageHasHeaderStore.set(true)

  const welcomeMessage = 'Welcome to OIDS '
  let help = false
</script>

<div out:fade class="landingPage">
  {#if $isLoggedInStore && $userStore}
    <TypeWriter text={welcomeMessage + $userStore.name} />
  {:else}
    <TypeWriter
      text={welcomeMessage + $guestUserStore.name}
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

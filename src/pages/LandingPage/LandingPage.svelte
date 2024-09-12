<script lang="ts">
  //Svelte
  import { fade } from 'svelte/transition'

  //Stores
  import { guestUser, pageHasHeaderStore, userStore } from '../../stores/stores'

  //Components
  import TypeWriter from '../../components/typeWriter/TypeWriter.svelte'
  import { navigate } from 'svelte-routing'
  import { gUser } from '../../utils/utils'

  pageHasHeaderStore.set(true)

  const welcomeMessage = `Welcome to OIDS ${$userStore ? $userStore.name : $guestUser.name}`
</script>

<div out:fade class="landingPage">
  <TypeWriter text={welcomeMessage} />
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

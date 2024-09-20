<script lang="ts">
  import Card from '../../components/card/card.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import Page from '../../components/page/page.svelte'
  import register from '../../lib/services/auth/register'
  import { loginHandler } from '../../utils/loginHandler'
  import { userStore } from '../../stores/stores'

  let name: string
  let email: string
  let password: string

  async function handleSubmit() {
    try {
      const tokens = await register(email, name, password)

      if (tokens) {
        await loginHandler(tokens.accessToken, tokens.refreshToken)
      }
    } catch (e: any) {
      console.log(e.response)
    }
  }
</script>

<Page>
  {#if !$userStore}
    <form on:submit|preventDefault={handleSubmit}>
      <input bind:value={name} type="text" placeholder="Name" />
      <input bind:value={email} type="email" placeholder="Email" />
      <input bind:value={password} type="password" placeholder="Password" />
      <Button90 buttonType="submit" buttonConfig={{ buttonText: 'Submit', clickCallback: () => {}, selected: false }}>Submit</Button90>
    </form>
  {:else if $userStore}
    <p>Welcome {$userStore.name} to Oids!</p>
  {/if}
</Page>

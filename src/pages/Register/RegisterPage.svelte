<script lang="ts">
  import Card from '../../components/card/card.svelte'
  import Button90 from '../../components/menu/Button90.svelte'
  import Page from '../../components/page/page.svelte'
  import register from '../../lib/services/auth/register'
  import { loginHandler } from '../../utils/loginHandler'
  import { userStore } from '../../stores/stores'
  import { handleAxiosError } from '../../lib/services/utils/errorHandler'
  import ProfilePage from '../ProfilePage/ProfilePage.svelte'
  import { navigate } from 'svelte-routing'
  import { onMount } from 'svelte'
  import AddShip from '../../components/ships/AddShip.svelte'
  import type { Step } from '../../lib/interface'
  import Ships from '../ProfilePage/Ships.svelte'
  import ProfileModal from '../../components/profile/ProfileModal.svelte'
  import { addAlert } from '../../stores/alertHandler'

  let name: string
  let email: string
  let password: string

  $: if (onboardingSteps) {
    checkProgress()
  }

  async function handleSubmit() {
    onboardingSteps.forEach((step) => (step.completed = false))
    try {
      const tokens = await register(email, name, password)

      if (tokens) {
        await loginHandler(tokens.accessToken, tokens.refreshToken)
        addAlert('success', `Welcome to Oids - ${name}`)
        onboardingSteps[0].completed = true
      }
    } catch (e: any) {
      handleAxiosError(e)
    }
  }

  function checkProgress() {
    stepProgress = onboardingSteps.filter((step) => {
      if (step.completed) {
        return step
      }
    }).length

    if ($userStore) {
      onboardingSteps[0].completed = true
    }
    if ($userStore?.ships.length) {
      onboardingSteps[1].completed = true
    }
  }

  $: stepProgress = 0

  const registerStep = { desc: 'Register', completed: false } as Step
  const addShipStep = { desc: 'Add ship', completed: false } as Step

  let onboardingSteps: Step[] = [registerStep, addShipStep]

  onMount(() => {
    if ($userStore) {
      onboardingSteps[0].completed = true
    }
    if ($userStore?.ships.length) {
      onboardingSteps[1].completed = true
    }
  })
</script>

<Page>
  <div class="steps">
    <ol style="text-align: left;">
      <p style="text-align: left;">
        Progress: {stepProgress}/{onboardingSteps.length}
      </p>

      {#each onboardingSteps as step}
        <li style="color: {step.completed ? 'var(--main-accent2-color)' : ''}">
          {step.desc}
          {#if step.completed}
            ☑️
          {:else}
            ◼️
          {/if}
        </li>
      {/each}
    </ol>
  </div>
  <div>
    {#if stepProgress > 0}
      <ProfileModal />
    {/if}
    {#if stepProgress > 1}
      <Ships />
    {/if}
  </div>

  {#if !$userStore}
    <form on:submit|preventDefault={handleSubmit}>
      <input bind:value={name} type="text" placeholder="Name" />
      <input bind:value={email} type="email" placeholder="Email" />
      <input bind:value={password} type="password" placeholder="Password" />
      <Button90 buttonType="submit" buttonConfig={{ buttonText: 'Submit', clickCallback: () => {}, selected: false }}>Submit</Button90>
    </form>
  {:else if stepProgress === 1}
    <AddShip
      openModal
      closeModal={(ship) => {
        if (ship) {
          onboardingSteps[1].completed = true
        }
      }}
    />
  {/if}
</Page>

<style>
  .steps {
    display: flex;
    flex-direction: row;
    border-right: 1px solid var(--main-accent2-color);
    max-width: none;
    padding: 1em;
    margin-right: 1em;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-start;
  }
</style>

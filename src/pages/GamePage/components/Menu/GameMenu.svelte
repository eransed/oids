<script lang="ts">
  import { navigate } from 'svelte-routing'
  import type { Button90Config } from '../../../../lib/interface'
  import type { Game } from '../../../../lib/game'
  import { settingsStore } from '../../../../stores/stores'
  import { toggleAndGetTheme } from '../../../../style/defaultColors'
  import { ActiveKeyMapStore, initKeyControllers, removeKeyControllers } from '../../../../lib/input'
  import { onMount } from 'svelte'
  import MenuWrapper from '../../../../components/menu/MenuWrapper.svelte'
  import Button90 from '../../../../components/menu/Button90.svelte'

  export let currentGame: Game

  onMount(() => {
    removeKeyControllers()

    document.addEventListener('keydown', handleKeyEvents)
  })

  function deleteEventListener() {
    document.removeEventListener('keydown', handleKeyEvents)
  }

  function handleKeyEvents(e: KeyboardEvent) {
    if (e.key === 't') {
      $settingsStore = toggleAndGetTheme()
    }

    if (e.key === 'e' || e.key === 'Escape') {
      $ActiveKeyMapStore.menu.store = false
      deleteEventListener()
      initKeyControllers()
    }

    if (e.key === 'q') {
      $ActiveKeyMapStore.menu.store = false
      currentGame.stopGame()
      navigate('/play')
      deleteEventListener()
    }
  }

  const theme: Button90Config = {
    buttonText: 'Theme (T)',
    clickCallback() {
      $settingsStore = toggleAndGetTheme()
    },
    selected: false,
  }

  const continueGame: Button90Config = {
    buttonText: 'Continue (E)',
    clickCallback() {
      $ActiveKeyMapStore.menu.store = false
      initKeyControllers()
      deleteEventListener()
    },
    selected: false,
  }

  const exit: Button90Config = {
    buttonText: 'Quit Game (Q)',
    clickCallback() {
      $ActiveKeyMapStore.menu.store = false
      currentGame.stopGame()

      navigate('/play')
      deleteEventListener()
    },
    selected: false,
  }

  const buttons = [theme, continueGame, exit]
</script>

<MenuWrapper>
  <ul class="buttonList">
    <h3 class="menuHeader">In-Game Menu</h3>
    {#each buttons as button}
      <li class="button">
        <Button90 buttonConfig={button} />
      </li>
    {/each}
  </ul>
</MenuWrapper>

<style>
  :root {
    --color: rgb(99, 136, 179, 1);
    --outlineColor: rgb(36, 22, 159);
    --opacity: 0.6;
  }

  .buttonList {
    width: 100%;
    list-style: none;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    z-index: 1;
  }

  .buttonList li {
    width: 95%;
    margin-top: 0.5em;
  }

  .menuHeader {
    text-transform: uppercase;
    font-size: 12px;
    color: var(--main-text-color);
  }

  .buttonList:hover > .button {
    opacity: 0.6;
    transition: all;
    transition-duration: 0.5s;
  }

  .buttonList:hover .button:hover {
    opacity: 1;
    transition: all;
    transition-duration: 0.5s;
  }

  .buttonList .button {
    transition: all;
    transition-duration: 0.5s;
  }
</style>

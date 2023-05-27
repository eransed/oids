<script lang="ts">
  //Imports
  import Button90 from "./Button90.svelte"
  import type { Button90Config } from "../../interfaces/menu"
  import MenuWrapper from "./MenuWrapper.svelte"
  import { onDestroy } from "svelte"
  import { addEventListener_test } from "../../stores/eventListenerStore"

  // used to disable game controllers while menu is open
  import { initKeyControllers, removeKeyControllers } from "../../lib/input"

  //Exports
  export let menuOpen: boolean = false
  export let buttons: Button90Config[]
  export let menuHeader: string = "Menu"

  const toggleMenu = (): void => {
    menuOpen = !menuOpen
    if (menuOpen) {
      removeKeyControllers()
    } else {
      initKeyControllers()
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      console.log("Escape")
      toggleMenu()
    }
  }

  //Add the event listener using the reusable function
  const cleanup = addEventListener_test(handleKeyDown)

  onDestroy(() => {
    //Call the cleanup function
    cleanup()
    document.removeEventListener("keydown", handleMenuSelection)
  })

  const rotate = (index: number, size: number): number => {
    if (index < 0) return (size + (index % size)) % size
    return index % size
  }

  function handleMenuSelection(event: KeyboardEvent): void {
    let selectedIndex = 0

    buttons.forEach((b, index) => {
      if (b.selected) {
        selectedIndex = index
        return
      }
      // No selected button, default to the first one
      buttons[0].selected = true
    })

    buttons.forEach((b) => {
      b.selected = false
    })

    if (event.code === "ArrowUp") {
      selectedIndex--
    } else if (event.code === "ArrowDown") {
      selectedIndex++
    } else if (event.code === "Enter") {
      buttons[selectedIndex].clickCallback()
    }
    selectedIndex = rotate(selectedIndex, buttons.length)
    buttons[selectedIndex].selected = true
    // console.log('code =', event.code, ', key =',event.key)
  }

  $: if (menuOpen) {
    document.addEventListener("keydown", handleMenuSelection)
  } else {
    document.removeEventListener("keydown", handleMenuSelection)
  }
</script>

<style>
  :root {
    --color: rgb(99, 136, 179, 1);
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

  @media screen and (max-width: 600px) {
    .buttonList {
      zoom: 1;
    }
  }

  @media screen and (max-width: 350px) {
    .buttonList {
      zoom: 0.8;
    }
  }

  @media screen and (max-width: 300px) {
    .buttonList {
      zoom: 0.5;
    }
  }

  .buttonList li {
    width: 95%;
    margin-top: 0.5em;
  }

  .menuHeader {
    text-transform: uppercase;
    font-size: 12px;
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

{#if menuOpen}
  <MenuWrapper>
    <ul class="buttonList">
      <h3 class="menuHeader">{menuHeader}</h3>
      {#each buttons as button}
        <li class="button">
          <Button90 buttonConfig={button} />
        </li>
      {/each}
    </ul>
  </MenuWrapper>
{/if}

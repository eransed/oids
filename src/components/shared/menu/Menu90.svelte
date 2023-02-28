<script lang="ts">
  import Button90 from "./Button90.svelte"
  import type { Button90Config } from "../../interface"
  export let menuOpen: boolean
  export let buttons: Button90Config[]
  export let menuHeader: string = "Menu"

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
    console.log("adds menu events")
    document.addEventListener("keydown", handleMenuSelection)
  } else {
    console.log("remove menu events")
    document.removeEventListener("keydown", handleMenuSelection)
  }
</script>

<style>
  :root {
    --color: rgb(99, 136, 179, 1);
    --opacity: 0.6;
  }

  .buttonList {
    min-width: 250px;
    min-height: fit-content;
    padding: 20px;
    list-style-type: none;
    position: absolute;
    opacity: 0.8;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    border-radius: 8px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--color);
    background: rgb(25, 0, 255, 0.1);
    box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -webkit-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -moz-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
  }

  .buttonList li {
    width: 95%;
    margin-top: 0.5em;
  }

  .menuHeader {
    text-transform: uppercase;
    font-size: 12px;
  }
</style>

<ul class="buttonList">
  <h3 class="menuHeader">{menuHeader}</h3>
  {#each buttons as button}
    <li><Button90 buttonConfig={button} /></li>
  {/each}
</ul>

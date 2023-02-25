<script lang="ts">
  import Button90 from "./Button90.svelte"
  import type { Button90Config } from "../../interface"
  export let menuOpen: boolean
  export let buttons: Button90Config[]

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
  .buttonList {
    list-style-type: none;
    /* border: 4px solid #fff; */
    border-radius: 8px;
    /* background: rgb(0, 0, 0);
    background: linear-gradient(
      133deg,
      rgba(0, 0, 0, 1) 0%,
      rgba(20, 255, 0, 0.08587184873949583) 83%,
      rgba(255, 255, 255, 0.06066176470588236) 100%
    ); */
    position: absolute;
    opacity: 0.8;
  }
</style>

<ul class="buttonList">
  {#each buttons as button}
    <li><Button90 buttonConfig={button} /></li>
  {/each}
</ul>

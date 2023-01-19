

<script lang="ts">
  import Menu90 from './Menu90.svelte'
  
  import type { Button90Config } from './interface'

  import { onMount } from 'svelte'

  import { createSpaceObject } from '../lib/factory'
  import { menu, showMenu } from '../lib/stores'
  import { getMenu } from '../lib/menu'
  import { Game } from '../lib/game'

  let menuOpen = true
  showMenu.set(menuOpen)
  showMenu.subscribe(value => {menuOpen = value})

  $: display = menuOpen ? 'block' : 'none'

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menuOpen = !menuOpen
  })

  function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  let game: Game
  // let localPlayer: SpaceObject

  // Variable to subscribe on menu store
  let chosenMenu: Button90Config[]
  
  onMount(() => {
    console.log ('mount...')
    const localPlayer = createSpaceObject('LocalPlayer')
    game = new Game(getCanvas(), localPlayer)

    // Setting welcome menu
    menu.set(getMenu(game))

    // Subscribing on store
    menu.subscribe(value => {chosenMenu = value})
  })

</script>

<style>
  #menu_test {
    color: #fff;
    position: fixed;
  }
  
  #game_canvas {
    width: 100%;
    position: absolute;
    /* cursor: none; */
  }

</style>

<canvas id="game_canvas"></canvas>

{#if game}
<div id="menu_test" style:display>
  <Menu90 menuOpen={menuOpen} buttons={chosenMenu}></Menu90>
</div>
{/if}



<script lang="ts">
  import Menu90 from './Menu90.svelte'
  
  import type { Button90Config } from './interface'

  import { onMount } from 'svelte'

  import { createSpaceObject } from '../lib/factory'
  import { menu, showMenu } from '../lib/stores'
  import { getMenu } from '../lib/menu'
  import { Game } from '../lib/game'
  import { removeKeyControllers } from '../lib/input'

  let menuOpen = true
  showMenu.set(menuOpen)
  showMenu.subscribe(value => {menuOpen = value})



  $: display = menuOpen ? 'flex' : 'none'

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menuOpen = !menuOpen
  })

  export function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  let game: Game
  

  // let localPlayer: SpaceObject

  // Variables to subscribe on menu store
  let chosenMenu: Button90Config[]
  
  onMount(() => {
    console.log ('mount...')
    const localPlayer = createSpaceObject('LocalPlayer')
    game = new Game(getCanvas(), localPlayer, showDeadMenu)

    // Setting welcome menu
    menu.set(getMenu(game))
  
    // Subscribing on store
    menu.subscribe(value => {chosenMenu = value})
    game.startWelcomeScreen()
  })

  const showDeadMenu = (): void => {
    removeKeyControllers()
    menu.set(getMenu(game))
    showMenu.set(true)
  }

</script>

<style>
  #game_menu {
    color: #fff;
    justify-content: center;
    align-content: center;
  }
  
  #game_canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
    /* cursor: none; */
  }
  
  #menuWrapper{
    height: 70vh;
    display: flex;
    flex-flow: wrap;
    justify-content: center;
    align-content: center; 
    
  }

</style>

<canvas id="game_canvas"></canvas>

{#if game}
<div id='menuWrapper' >
<div id="game_menu" style:display>
  <Menu90 menuOpen={menuOpen} buttons={chosenMenu}></Menu90>
</div>
</div>
{/if}

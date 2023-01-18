

<script lang="ts">
  
  import type { Button90Config } from './interface'
  import Menu90 from './Menu90.svelte'
  import { onMount } from 'svelte'
  import { Game } from '../lib/game'
  import { createSpaceObject } from '../lib/factory'
  import type { SpaceObject } from '../lib/types';
  import { getMenu } from '../lib/menu'
  import { menu } from '../lib/stores'

  function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  let game: Game
  let localPlayer: SpaceObject

  //Variable to subscribe on menu store
  let chosenMenu: Button90Config[]
  
  onMount(() => {
    console.log ('mount...')
    localPlayer = createSpaceObject('LocalPlayer')
    game = new Game(getCanvas(), localPlayer)

    //Setting welcome menu
    menu.set(getMenu(game, handleStartMultiplayerClick))

    //Subscribing on store
    menu.subscribe(value => {chosenMenu = value})
    
  });

  let menuOpen = true
  $: display = menuOpen ? 'block' : 'none'

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menuOpen = !menuOpen
    
  })

  function handleStartMultiplayerClick(): void {
    if (game.isRunning()) {
      console.log('Game is already running')
    } else {
      game.startMultiplayer()
    }
    menuOpen = false
  }

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



<script lang="ts">
  
  import type { Button90Config } from './interface'
  import Menu90 from './Menu90.svelte'
  import { onMount } from 'svelte'
  import { Game } from '../lib/game'
  import { createSpaceObject } from '../lib/factory'
  import type { SpaceObject } from '../lib/types';

  function getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>document.getElementById("game_canvas")
  }

  let game: Game
  let localPlayer: SpaceObject
  
  onMount(() => {
    console.log ('mount...')
    localPlayer = createSpaceObject('LocalPlayer')
    game = new Game(getCanvas(), localPlayer)
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

  const menuItems: Button90Config[] = [
  {
      buttonText: 'Singleplayer',
      clickCallback: () => {console.log('Singleplayer')},
      selected: true,
  },
  {
      buttonText: 'Multiplayer', 
      clickCallback: () => {
        handleStartMultiplayerClick()
      },
      selected: false,
  },
  {
      buttonText: 'Settings', 
      clickCallback: () => {console.log('Settings')},
      selected: false,
  },
  {
      buttonText: 'Exit game', 
      clickCallback: () => {
        console.log('stops game')
        game.stopGame()
      },
      selected: false,
  }]


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

<div id="menu_test" style:display>
  <Menu90 menuOpen={menuOpen} buttons={menuItems}></Menu90>
</div>

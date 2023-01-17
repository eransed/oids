
<canvas id="game_canvas"></canvas>


<script lang="ts">
  
  import WelcomeSreen from './WelcomeSreen.svelte'
  import { onMount } from 'svelte'
  import { game } from '../lib/game'

  onMount(() => {
    const canvasElement: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("game_canvas")
    if (canvasElement === null){
      console.error('Could not find id "game_canvas"')
    } else {
      game(canvasElement)
    }
  });

</script>




<canvas id="game_canvas"></canvas>

<script lang="ts">
  
  import { onMount } from 'svelte'
  import { game } from '../lib/game';
  import { getMenu } from '../lib/menu';

  onMount(() => {
    const canvasElement: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("game_canvas")
    if (canvasElement === null){
      console.error('Could not find id "game_canvas"')
    } else {
      game(canvasElement)
    }
  });

</script>

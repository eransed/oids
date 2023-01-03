
<canvas id="game_canvas"></canvas>

<script lang="ts">
  
  import { onMount } from 'svelte'
  import { game } from '../lib/game';

  onMount(() => {
    const canvasElement: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("game_canvas")
    const ctx: CanvasRenderingContext2D | null = canvasElement.getContext("2d")
    if (ctx === null){
      console.error('ctx is null')
    } else {
      game(ctx)
    }
  });

</script>

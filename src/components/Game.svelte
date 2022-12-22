
<canvas id="game_canvas"></canvas>

<script lang="ts">
  
  import { onMount } from 'svelte'
  import { oids_game } from '../lib/game';

  onMount(() => {
    const canvasElement: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("game_canvas")
    const ctx = canvasElement.getContext("2d")
    oids_game(ctx)
  });

</script>

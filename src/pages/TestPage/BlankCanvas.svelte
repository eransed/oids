<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import { error, info, vec2dArray, to_string, log, warn } from "mathil"
  import { clearScreen, renderPoint } from "../../lib/render/render2d"

  let canvas: HTMLCanvasElement

  onMount(() => {
    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d")
    ctx.canvas.width = 400
    ctx.canvas.height = 300
    info("mount")

    if (!ctx) {
      error("Failed to get canvas context")
      return
    }

    const points = vec2dArray(10, 290, 10)
    points.forEach((p) => {
      log(to_string(p))
    })

    let frame = requestAnimationFrame(loop)

    function loop(t: number) {
      frame = requestAnimationFrame(loop)

      clearScreen(ctx, "#fff")

      points.forEach((p) => {
        renderPoint(ctx, p, "#000", 3)
      })
    }

    info("mount done")

    return () => {
      cancelAnimationFrame(frame)
    }
  })

  onDestroy(() => {
    warn("destroy")
  })
</script>

<canvas bind:this={canvas} />

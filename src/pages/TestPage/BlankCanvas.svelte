<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import { error, info, vec2dArray, to_string, log, warn, EveryInterval, type Vec2d, type Line, connectPoints, boundingBox } from "mathil"
  import { clearScreen, renderLine, renderPoint } from "../../lib/render/render2d"

  let canvas: HTMLCanvasElement

  onMount(() => {
    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d")
    ctx.canvas.width = 300
    ctx.canvas.height = 300
    info("mount")

    if (!ctx) {
      error("Failed to get canvas context")
      return
    }

    let points: Vec2d[] = []
    let lines: Line[] | null = []
    let sqLines: Line[] | null = []
    function updatePoints(count = 1) {
      // points = vec2dArray(count, 250, 50)
      points = points.concat(vec2dArray(1, 280, 80))
      lines = connectPoints(points)
      sqLines = connectPoints(boundingBox(points), true)
      if (points.length > 5) points.splice(0, 1)
    }

    updatePoints()

    const every = new EveryInterval(10)
    points.forEach((p) => {
      log(to_string(p))
    })

    let frame = requestAnimationFrame(loop)

    let count = 1

    function loop(t: number) {
      frame = requestAnimationFrame(loop)

      clearScreen(ctx, "#fff")

      points.forEach((p) => {
        renderPoint(ctx, p, "#f00", 3)
      })

      if (lines) {
        lines.forEach((l) => {
          renderLine(ctx, l, "#000", 1)
        })
      }

      if (sqLines) {
        sqLines.forEach((l) => {
          renderLine(ctx, l, "#00f", 2)
        })
      }

      every.tick(() => {
        updatePoints(count++)
        if (count > 1000) {
          count = 1
          points = []
        }
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

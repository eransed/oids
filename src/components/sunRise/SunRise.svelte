<script lang="ts">
  import { fade } from "svelte/transition"
  import Sun from "./sun.svelte"

  export let sunShine: number = 0.15
  export let sunRiseSpeed: number = 10

  let i: number = 0
  let root = document.documentElement

  const SunRise = () => {
    setTimeout(() => {
      if (i < sunShine) {
        root.style.setProperty("--_transparency", i.toString())
        i += 0.002
        SunRise()
        if (i === sunShine) {
          return
        }
      }
    }, sunRiseSpeed)
  }

  SunRise()
</script>

<style>
  :root {
    --_transparency: 0;
  }

  .wrapper {
    display: flex;
    position: absolute;
    height: 100vh;
    width: 100vw;
    font-family: "Courier New", Courier, monospace;
    color: rgb(0, 0, 0) 000;
    background-image: linear-gradient(121deg, rgb(0, 0, 0, var(--_transparency)) 0%, rgb(255, 204, 112, var(--_transparency)) 100%);
  }
</style>

<div class="wrapper" out:fade in:fade>
  <Sun />
  <slot />
</div>

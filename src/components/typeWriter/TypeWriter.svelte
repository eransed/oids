<script lang="ts">
  //Util
  import { rndi } from "../../lib/math"

  export let text: string
  export let speed: number = 100

  let i = 0
  let typeWriterText: string = ""

  console.log("what")

  const typeWriter = (): void => {
    setTimeout(() => {
      if (i < text.length) {
        typeWriterText += text.charAt(i)
        i++
        typeWriter()
      }
    }, speed)
  }

  typeWriter()
</script>

<style>
  .wrapper {
    position: absolute;
    margin: auto;
    inset: 0;
    min-height: 100vh;
    max-width: 50vw;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
  }
</style>

<div class="wrapper">{typeWriterText}</div>

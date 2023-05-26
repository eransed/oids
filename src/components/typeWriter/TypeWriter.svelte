<script lang="ts">
  //Util
  import { rndi } from "../../lib/math"

  export let text: string
  export let speed: number = 100
  export let humanRandomeness: boolean = false
  export let deleteMessage: boolean = false

  let i = 0
  let typeWriterText: string = ""
  let finished: boolean = false

  const typeWriter = (): void => {
    //This is the typewriter. For every 'pass' it puts a new letter in variable typeWriterText
    //which outputs in the html.
    if (!finished) {
      setTimeout(() => {
        if (i < text.length) {
          typeWriterText += text.charAt(i)
          i++
          if (i === text.length) {
            finished = true
            if (!deleteMessage) return
          }
          typeWriter()
        }
      }, speed * (humanRandomeness ? rndi(0.5, 2) : 1))
    }

    //Deleting message after message is finished and deleteMessage is true
    //One letter at a time
    if (finished && deleteMessage) {
      setTimeout(() => {
        if (i > 0) {
          typeWriterText = typeWriterText.slice(0, -1)
          i--
          if (i === 0) {
            return
          }
          typeWriter()
        }
      }, speed * 0.5)
    }
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

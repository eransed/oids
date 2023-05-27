<script lang="ts">
  import { fade } from "svelte/transition"

  //Util
  import { rndi } from "../../lib/math"

  /**
   * The text that will be written out by the TypeWriter
   *
   * @type {string}
   */
  export let text: string

  /**
   * A higher number equals slower type speed
   *
   * @type {number}
   * @optional
   */
  export let speed: number = 100

  /**
   * If true, a random number will make the speed change.
   * Which mimicks the inconsistency of a human typing.
   *
   * @type {boolean}
   * @optional
   */
  export let humanRandomeness: boolean = false

  /**
   *
   * Deleting the message one letter at a time after it's done printing it.
   *
   * @type {boolean | undefined}
   * @optional
   */
  export let deleteMessage: boolean = false

  /**
   * A higher number equals slower speed
   *
   * @type {number}
   * @optional
   */
  export let deleteSpeed: number = speed

  export let callback: () => void = () => {}

  /**
   * At first its empty, then slowly (or fast) we have a message by the typeWriter function.
   */
  let typeWriterText: string = ""
  let finished: boolean = false
  let i = 0

  /**
   * This is the typewriter. For every 'pass' it puts a new letter in variable typeWriterText
   * which outputs in the html.
   */
  const typeWriter = (): void => {
    if (!finished) {
      setTimeout(() => {
        if (i < text.length) {
          typeWriterText += text.charAt(i)
          i++
          if (i === text.length) {
            finished = true
            callback()
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
      }, deleteSpeed)
    }
  }

  typeWriter()
</script>

<style>
  .wrapper {
    /* position: absolute;
    margin: auto;
    inset: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-content: center; */
    max-width: 450px;
    flex-wrap: wrap;
    line-break: strict;
    line-height: 1.5;
  }
</style>

<div in:fade={{ delay: 150 }} out:fade class="wrapper">{typeWriterText}</div>

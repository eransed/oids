<!-- 
  @component
  
  Want text to appear being typed? Use this one!
  
 -->

<script lang="ts">
  import { fade } from 'svelte/transition'

  //Util
  import { rndi } from 'mathil'

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

  /**
   * Delay until text starts to print (in milleseconds)
   *
   * @type {number}
   * @optional
   */
  export let delaySpeed: number = 0

  /**
   * 3 dots iterating back and forth to imitate a loading state.
   *
   * @type {boolean}
   * @optional
   */
  export let loadingDots: boolean = false

  /**
   * A callback that fires when typeWriter is done printing
   */
  export let doneCallback: () => void = () => {}

  /**
   * A callback that fires when typeWriter starts to print
   */
  export let startCallback: () => void = () => {}

  /**
   * At first its empty, then slowly (or fast) we have a message by the typeWriter function.
   */
  let typeWriterText: string = ''
  let finished: boolean = false
  let i = 0

  let dots = {
    dots: '...',
    up: 0,
    down: 0,
  }

  /**
   * This is the typewriter. For every 'pass' it puts a new letter in variable typeWriterText
   * which outputs in the html.
   */
  const typeWriter = (): void => {
    if (!finished) {
      if (i === 0) {
        startCallback()
      }
      setTimeout(
        () => {
          if (i < text.length) {
            typeWriterText += text.charAt(i)
            i++
            if (i === text.length) {
              finished = true
              doneCallback()
              typeWriter()
              if (!deleteMessage) return
            }
            typeWriter()
          }
        },
        speed * (humanRandomeness ? rndi(0.5, 3) : 1),
      )
    }

    if (finished && loadingDots) {
      setTimeout(() => {
        if (dots.up < dots.dots.length) {
          typeWriterText += dots.dots.charAt(dots.up)
          dots.up++
          dots.down = dots.up
        } else if (dots.down > 0) {
          typeWriterText = typeWriterText.slice(0, -1)
          dots.down--
          if (dots.down === 0) {
            dots.up = 0
          }
        }
        typeWriter()
      }, 350)
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
  setTimeout(() => {
    typeWriter()
  }, delaySpeed)
</script>

<div in:fade={{ delay: 150 }} out:fade class="wrapper"><p>{typeWriterText}</p></div>

<style>
  .wrapper {
    max-width: 450px;
    flex-wrap: wrap;
    line-break: strict;
    line-height: 1.5;
    z-index: 1;
  }
</style>

<script lang="ts">
  /**
   * Different types of cursors allowed
   *
   * default, help, wait, crosshair, not-allowed, zoom-in, grab, pointer
   */
  export let cursor = 'none'
  export let clickedOnCard: () => void = () => {}
  export let hoverEffect: boolean = true

  function shouldEffectHover() {
    if (hoverEffect) {
      return 'hoverEffect'
    }
    if (!hoverEffect) {
      return ''
    }
  }
</script>

<div id="cardWrapper" class={shouldEffectHover()} style="cursor: {cursor}" on:click={clickedOnCard} on:keydown={() => {}}>
  <slot />
</div>

<style>
  :root {
    --cardShadow: 0.4;
  }

  #cardWrapper {
    display: grid;
    justify-content: center;
    /* align-content: center; */
    flex-wrap: wrap;
    height: fit-content;
    min-width: 300px;
    min-height: 300px;
    margin: 1em;
    border-radius: 4px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--color);
    outline: 2px solid rgb(36, 22, 159);
    /* box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--cardShadow));
    -webkit-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--cardShadow));
    -moz-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--cardShadow)); */
    transition: all 0.5s;
  }

  #cardWrapper:is(.hoverEffect):hover {
    --cardShadow: 1;
  }
</style>

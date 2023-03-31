<script lang="ts">
  export let visible: boolean = true;
  export let title: string = "";
  export let size: number = 1;
  export let neon: boolean = false;
  export let color: string = `rgb(${0},${255},${0})`;

  //Size of font
  $: scale = size;
</script>

<style>
  div {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    height: 15%;
    width: 100%;
    position: relative;
  }
  h1 {
    text-align: center;
    display: block;
    -webkit-text-stroke: 1px var(--color);
    color: rgb(150, 150, 150, 0);
    text-shadow: 0 0 0.8em var(--color);
    z-index: 1;
  }

  .neon {
    animation-name: neon;
    animation-duration: 0.7s;
    animation-direction: alternate;
    animation-iteration-count: infinite;
  }

  @keyframes neon {
    0% {
      -webkit-text-stroke: 1px var(--color);
    }
    25% {
      -webkit-text-stroke: 0.9px var(--color);
    }
    50% {
      -webkit-text-stroke: 1.1px var(--color);
    }
    75% {
      -webkit-text-stroke: 1.2px var(--color);
    }
    85% {
      -webkit-text-stroke: 1.1px var(--color);
    }
    100% {
      -webkit-text-stroke: 0.8px var(--color);
    }
  }
</style>

{#if visible}
  <div>
    <h1 style:scale style="--color: {color}" class={neon ? "neon" : ""}>
      {title}
      <slot />
    </h1>
  </div>
{/if}

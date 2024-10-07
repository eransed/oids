<script lang="ts">
  export let title = ''
  export let progress = 0
  export let max = 100
  export let bgColor = ''
  export let progressColor = 'var(--main-accent2-color)'
</script>

<!-- <p class="title">{title}</p> -->
<div class="bar" style="background-color: {progressColor}; width: {(progress / max) * 100}%"></div>

<style>
  .bar::before {
    content: '';
    width: 100%;
    background-color: color-mix(in srgb, var(--main-accent-color) 10%, var(--main-text-color) 10%);
    position: absolute;
    height: 100%;
    border-radius: 0.5em;
  }
  .bar {
    border-radius: 0.5em;
    z-index: 1;
    content: '';
    display: block;
    transition: all 0.7s;
  }

  .title {
    position: absolute;
    inset: 0;
    margin: 33%;
    color: var(--main-card-color);
    z-index: 2;
  }
</style>

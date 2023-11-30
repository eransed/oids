<script lang="ts">
  export let title = 'Progress'
  export let progress = 0
  export let max = 100
</script>

<div class="wrapper">
  <!-- <p class="title">{title}</p> -->
  <div class="bar" style="width: {(progress / max) * 100}%" />
</div>

<style>
  .wrapper {
    position: absolute;
    width: 20em;
    height: 1em;
    background-color: var(--main-card-color);
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    bottom: 30%;
    margin-left: 5%;
    border-radius: 0.5em;
  }

  .bar {
    border-radius: 0.5em;
    background-color: var(--main-accent2-color);
    z-index: 1;
    content: '';
    display: block;
    transition: all 0.7s;
  }

  .title {
    position: absolute;
    inset: 0;
    margin: auto;
    color: var(--main-card-color);
    z-index: 2;
  }
</style>

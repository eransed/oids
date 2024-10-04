<script lang="ts">
  import TypeWriter from '../typeWriter/TypeWriter.svelte'

  export let text: string
  export let typeWriter = true
</script>

<p class="info">
  {#if typeWriter}
    <TypeWriter {text} speed={30} humanRandomeness />
  {:else}
    {text}
  {/if}
</p>

<style>
  .info {
    border-bottom: 1px solid var(--main-accent2-color);
    width: fit-content;
    position: absolute;
    top: 0;
    z-index: 5;
  }
</style>

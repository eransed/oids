<script lang="ts">
  export let text: string
</script>

<p class="info">{text}</p>

<style>
  .info {
    border-bottom: 1px solid var(--main-accent2-color);
    width: fit-content;
    position: absolute;
    top: 0;
    z-index: 5;
  }
</style>

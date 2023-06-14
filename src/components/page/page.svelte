<script lang="ts">
  //Svelte-fx
  import { fade, slide } from "svelte/transition"
</script>

<style>
  .pageWrapper {
    height: 100vh;
    width: 100vw;
    top: 88px;
    display: flex;
    margin: 2em;
    position: relative;
    align-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    color: #fff;
  }

  @media screen and (max-width: 600px) {
    .pageWrapper {
      margin: 1em;
    }
  }
</style>

<div class="pageWrapper" in:slide={{ duration: 750 }}>
  <slot />
</div>

<script lang="ts">
  import { onMount } from 'svelte'

  //Svelte-fx
  import { slide } from 'svelte/transition'
</script>

<div class="pageWrapper" in:slide={{ duration: 750 }}>
  <slot />
</div>

<style>
  :root {
    --topBarHeight: 0;
    --innerHeight: 0;
  }

  .pageWrapper {
    width: 100vw;
    top: 118px;
    display: flex;
    position: relative;
    align-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    color: #fff;
    max-height: 95vh;
    /* overflow-y: auto; */
  }

  @media screen and (max-width: 1000px) {
    .pageWrapper {
      margin: 0em;
      justify-content: center;
      width: 100%;
      max-height: 90vh;
      margin-top: 2em;
    }
  }

  @media screen and (max-width: 500px) {
    .pageWrapper {
      justify-content: center;
      margin: 0;
      top: 75px;
      max-height: 90vh;
    }
  }

  @media screen and (max-width: 360px) {
    .pageWrapper {
      justify-content: left;
    }
  }

  @media screen and (max-width: 750px) and (min-width: 400px) {
    .pageWrapper {
      height: 100vh;
      width: 100vw;
      top: 55px;
      padding: 0px;
      margin: 0px;
      margin-top: 2em;
    }
  }

  /* @media screen and (max-height: 1200px) {
    .pageWrapper {
      height: 85vh;
    }
  } */
</style>

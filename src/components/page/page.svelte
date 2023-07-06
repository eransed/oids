<script lang="ts">
 //Svelte-fx
 import { slide } from 'svelte/transition'
</script>

<div class="pageWrapper" in:slide={{ duration: 750 }}>
 <slot />
</div>

<style>
 .pageWrapper {
  height: 100vh;
  width: 100vw;
  top: 88px;
  display: flex;
  margin-top: 2em;
  position: relative;
  align-content: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  color: #fff;
 }

 @media screen and (max-width: 1000px) {
  .pageWrapper {
   margin: 0em;
   justify-content: center;
   width: 100%;
  }
 }

 @media screen and (max-width: 700px) {
  .pageWrapper {
   top: 200px;
  }
 }

 @media screen and (max-width: 450px) {
  .pageWrapper {
   justify-content: left;
   margin: 0;
  }
 }
</style>

<!-- 
  @component
  
  A spinner to show when things need to load :)
  
 -->

<script lang="ts">
  import Ship from '../../assets/ships/ship.svg'
  import TypeWriter from '../typeWriter/TypeWriter.svelte'

  export let ship: boolean = false
  export let text: string = ''
</script>

{#if text} 
<p style="text-align: center;"><TypeWriter loadingDots text={text}/></p>
{/if}
{#if ship}
  <div class="ship">
    <img draggable="false" alt="Ship" src={Ship} />
  </div>
{:else}
  <div class="circle" />
{/if}

<style>
  .circle {
    width: 25px;
    height: 25px;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(47, 167, 252, 0.5);
    border-right-color: rgb(47, 167, 252, 0);
    border-radius: 50%;
    animation-name: spin;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    margin: auto;
  }

  .ship {
    justify-content: center;
    align-content: center;
    width: 200px;
    height: 200px;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(47, 167, 252, 0.5);
    border-right-color: rgb(47, 167, 252, 0);
    border-radius: 50%;
    /* margin: auto; */
    animation-name: spin;
    animation-duration: 3.5s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    display: flex;
  }

  .ship img {
    justify-self: center;
    width: 50%;
    animation: spinShip 3s linear infinite;
    opacity: 0.8;
    margin-top: 1em;
  }

  @keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spinShip {
    100% {
      -webkit-transform: rotate(-360deg);
      /* margin-top: 1em; */
    }
  }
</style>

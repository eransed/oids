<script lang="ts">
  import type { Ship } from '../../lib/interface'
  import { localPlayerStore, userStore } from '../../stores/stores'
  // import Cursor from '../mouse/cursor.svelte'
  import ShipCardImg from './ShipImg.svelte'

  export let ship: Ship
  export let clickedShip: (ship: Ship) => void = (ship) => {}

  $: chosenShip = $localPlayerStore.ship.id === ship.id
  $: width = chosenShip ? '8em' : '6em'
  $: height = chosenShip ? '8em' : '6em'

  function handleClickShip() {
    clickedShip(ship)
  }
</script>

<div class="shipWrapper" style="width: {width}; height: {height};">
  <button on:click={() => handleClickShip()} class="imgCard" style="background-color: {chosenShip ? 'var(--main-accent2-color)' : 'var(--main-accent-color)'}">
    <div class="level">{ship.level}</div>
    <ShipCardImg {ship} />
    <div class="shipDetails">
      <table style="text-align: center;">
        <tr>
          <td><b>{ship.name}</b></td>
        </tr>
      </table>
      <p />
    </div>
  </button>
</div>

<style>
  .shipWrapper {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    width: 8em;
    height: 8em;
    border-radius: 0.5em;
    margin: 1em;
    animation: fly 1s forwards;
    transition: all 250ms;
  }

  @keyframes fly {
    0% {
      transform: translate(-25px);
      /* position: absolute; */
    }
    50% {
      transform: translateY(+25px) rotate(5deg);
    }
  }

  .imgCard {
    margin: 3%;
    background: none;
    border: none;
    flex-direction: column;
    text-align: center;
    padding: 0.8em;
    align-content: center;
    justify-content: center;
    border-radius: 1.5em;
    /* border-top-left-radius: 70%; */
    z-index: 4;
    background: var(--main-accent2-color);
    transition: all 500ms;
    animation: spin 1s ease-in-out forwards;
    transform: scale(1);
    position: relative;
  }

  .imgCard:hover {
    transition: all 500ms;
    transform: scale(1.1);
  }

  .shipDetails {
    opacity: 0;
    height: 0px;
    transition: all 500ms;
    font-size: 0.7em;
    width: 100%;
    /* text-align: left; */
  }

  .shipDetails table {
    width: 100%;
  }

  .imgCard .shipDetails {
    opacity: 1;
    /* height: 10px; */
    padding-bottom: 1em;
    max-height: fit-content;
    transition: all 500ms;
  }

  .level {
    border-radius: 100%;
    text-align: center;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 30px;
    height: 30px;
    background-color: var(--main-card-color);
    box-shadow: 0px 0px 5px var(--main-accent-color);
    color: var(--main-text-color);
    position: absolute;
    top: -0.2px;
    left: -0.2px;
  }
</style>

<script lang="ts">
  import type { ChosenShip } from '../../lib/interface'
  import { localPlayer } from '../../stores/stores'
  import { getShipBundleCache } from '../../style/ships'

  export let chosenShip: ChosenShip
  export let shipOwner: string
  export let clickedShip: (ship: ChosenShip) => void = (ship) => {}

  $: yourship = $localPlayer.ship.userId === chosenShip.userId

  function handleClickShip() {
    if (yourship) {
      clickedShip(chosenShip)
    }
  }
</script>

<div class="shipWrapper">
  <button on:click={() => handleClickShip()} class="imgCard" style="background-color: {yourship ? 'var(--main-accent2-color)' : 'var(--main-accent-color)'}">
    <p>{shipOwner}</p>
    <div class="level">{chosenShip.level}</div>
    <img draggable="false" src={getShipBundleCache(chosenShip.shipVariant).svgUrl} alt={chosenShip.name} />
    <div class="shipDetails">
      <table>
        <tr>
          <td>Ship Name:</td>
          <td>{chosenShip.name}</td>
        </tr>
        <tr>
          <td>Variant:</td>
          <td>{chosenShip.shipVariant}</td>
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
    flex-direction: column;
    width: 8em;
    height: 8em;
    border-radius: 0.5em;
    margin: 1em;
    animation: fly 1s forwards;
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

  .imgCard img {
    width: 100%;
    min-width: 60px;
    margin: none;
  }

  .shipDetails {
    opacity: 0;
    height: 0px;
    transition: all 500ms;
    font-size: 0.7em;
    width: 100%;
    text-align: left;
  }

  .shipDetails table {
    width: 100%;
  }

  .imgCard:hover .shipDetails {
    opacity: 1;
    height: 20px;
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

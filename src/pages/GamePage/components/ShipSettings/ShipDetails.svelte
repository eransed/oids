<script lang="ts">
  import type { ChosenShip } from '../../../../lib/interface'
  import ShipImg from '../../../../components/ships/ShipImg.svelte'
  export let ship: ChosenShip
</script>

<div class="ship">
  <p>
    {ship.name}
  </p>
  <span style="display: flex; width: 60%; height: 60%;">
    <ShipImg {ship} />
  </span>
  <p>
    Lvl: {ship.level}
  </p>
  <p>
    XP: {ship.experience}
  </p>
</div>

<style>
  .ship {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .ship > * {
    margin: 0.5em;
  }
</style>

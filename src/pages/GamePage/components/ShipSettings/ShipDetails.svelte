<script lang="ts">
  import type { ChosenShip } from '../../../../lib/interface'
  import ShipImg from '../../../../components/ships/ShipImg.svelte'
  import { localPlayerStore } from '../Game/Utils/gameUtils'

  export let ship: ChosenShip
</script>

<div class="ship">
  <p>
    {ship.name}
  </p>
  <ShipImg {ship} />
  <p>
    Lvl: {ship.level}
  </p>
  <p>
    Experience: {'Add to ship interface...'}
  </p>
</div>

<style>
  .ship {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ship > * {
    margin: 0.5em;
  }
</style>

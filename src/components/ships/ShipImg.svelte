<script lang="ts">
  import type { ChosenShip } from '../../lib/interface'
  import { getShipBundleCache } from '../../style/ships'

  export let ship: ChosenShip
</script>

<img draggable="false" src={getShipBundleCache(ship.shipVariant).svgUrl} alt={ship.name} />

<style>
  img {
    width: 100%;
    min-width: 60px;
    margin: none;
  }
</style>

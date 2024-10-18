<script lang="ts">
  import type { Ship } from '../../lib/interface'
  import { getShipBundleCache } from '../../style/ships'

  export let ship: Ship
</script>

<img draggable="false" src={getShipBundleCache(ship.variant).svgUrl} alt={ship.name} />

<style>
  img {
    width: 100%;
    min-width: 60px;
    margin: none;
  }
</style>

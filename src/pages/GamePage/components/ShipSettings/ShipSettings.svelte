<script lang="ts">
  import { localPlayerStore } from "../Game/Utils/gameUtils"

  function prettySpaceObjectValue(value: any): string {
    if (typeof value === 'object') {
      let out = ''

      Object.entries(value).forEach((v) => {
        out += `${v[0]}: ${prettySpaceObjectValue(v[1])}, `
      })
      out = out.substring(0, out.length - 2)
      return out
    }
    return value
  }

</script>

<style>
  
  h6 {
    display: inline-block;
    margin-left: 40%;
    width: 100%;
  }

  div {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.1rem;
    padding-top: 0;
    font-size: 0.6rem;
    max-width: 35rem;
    min-width: 35rem;
  }

</style>

<h6>{$localPlayerStore.name} [{Object.keys($localPlayerStore).length}]</h6>
{#each Object.entries($localPlayerStore) as kv, index}
  <div><span style="color: {$localPlayerStore.color}">[{index + 1}].{kv[0]}</span>: {prettySpaceObjectValue(kv[1])}</div>
{/each}

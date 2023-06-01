<script lang="ts">
  import { ActiveKeyMap } from "../../../../lib/input"

  console.log(ActiveKeyMap)
</script>

{#each Object.entries(ActiveKeyMap) as [key, keyFunction]}
  <table style="width: 90%">
    <tr>
      <td>{key}</td>
      {#each Object.values(keyFunction) as value}
        <td>{value}</td>
      {/each}
    </tr>
  </table>
{/each}

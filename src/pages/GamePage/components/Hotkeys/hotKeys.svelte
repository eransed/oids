<script lang="ts">
  import { ActiveKeyMap } from "../../../../lib/input"
  import type { KeyFunction } from "../../../../lib/interface"

  let keyValues: KeyFunction[] = []

  Object.values(ActiveKeyMap).forEach((value) => {
    keyValues.push(value)
  })
</script>

<style>
  .scoreTable {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    position: relative;
    inset: 0;
    margin: auto;
  }

  table {
    max-height: 70%;
    display: block;
  }

  table,
  td {
    padding: 6px;
    font-weight: bold;
    font-size: 14px;
  }
</style>

<div class="scoreTable">
  <table>
    <thead>
      <tr>
        <th colspan="1">Function</th>
        <th colspan="1">Key</th>
      </tr>
    </thead>

    {#each keyValues as keyFunction}
      <tbody>
        <tr>
          <td>{keyFunction.displayText}</td>
          <td>{keyFunction.activators.map((v) => " " + v)}</td>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

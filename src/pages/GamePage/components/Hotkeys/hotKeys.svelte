<script lang="ts">
  import { keyDisplayName as keyDisplayText } from "../../../../lib/input"
  import { activeKeyStates } from "../Game/store/gameStores"
  export let activeColor: string
  console.log (`hotkey color: ${activeColor}`)
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
        <th colspan="1">Type</th>
      </tr>
    </thead>

    {#each $activeKeyStates as keyFunction}
      <tbody>
        <tr>
          <td style="color: {keyFunction.keyStatus ? activeColor : 'grey'}">{keyFunction.displayText}</td>
          <td>{keyFunction.activators.map((v) => " " + keyDisplayText(v))}</td>
          <td>{keyFunction.toggle ? '<toggle>': '<momentary>'}</td>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

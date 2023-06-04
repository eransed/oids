<script lang="ts">
  import { activeKeyStates, keyDisplayName as keyDisplayText } from "../../../../lib/input"
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
        <th style="color: {activeColor}" colspan="1">Function</th>
        <th style="color: {activeColor}" colspan="1">Key</th>
        <th style="color: {activeColor}" colspan="1">Type</th>
      </tr>
    </thead>

    {#each $activeKeyStates as keyFunction}
      <tbody>
        <tr>
          {#if keyFunction.keyStatus}
            <td style="color: {activeColor}">{'+ ' + keyFunction.displayText}</td>
          {:else}
            <td style="color: 'grey'">{'- ' + keyFunction.displayText}</td>
          {/if}
          <td>{keyFunction.activators.map((v) => " " + keyDisplayText(v))}</td>
          <td>{keyFunction.toggle ? '<toggle>': '<momentary>'}</td>
        </tr>
      </tbody>
    {/each}
  </table>
</div>

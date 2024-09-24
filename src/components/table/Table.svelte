<script lang="ts" generics="T extends {}, U extends {}">
  export let data: T[] = []
  export let converter: (d: T) => T | U = (d: T) => d

  $: convertedData = data.map((v) => {
    return converter(v)
  })
</script>

<table>
  <thead>
    <tr>
      {#each Object.keys(convertedData[0] || {}) as column}
        <th on:click={() => (convertedData = convertedData.reverse())}>{column.toUpperCase()}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each convertedData as row}
      <tr>
        {#each Object.values(row) as item}
          <td>{item}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    color: var(--main-text-color);
  }
  td:not(:first-child) {
    padding-left: 2em;
  }
</style>

<script lang="ts" generics="T extends {}">
  export let data: T[] = []

  console.log(data)
</script>

<table>
  <thead>
    <tr>
      {#each Object.keys(data[0] || {}) as column}
        <th on:click={() => console.log(column)}>{column.toUpperCase()}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data as row}
      <tr>
        {#each Object.values(row) as item}
          <td>{item}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

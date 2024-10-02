<script lang="ts" generics="T extends {}, U extends {}">
  import { Icons } from '../../style/icons'
  import Button90 from '../menu/Button90.svelte'

  export let data: T[] = []
  export let converter: (d: T) => T | U = (d: T) => d
  export let currentPage = 1
  export let itemsPerPage = 10
  export let pagination = false

  $: convertedData = data.map((v) => {
    return converter(v)
  })

  $: totalPages = Math.ceil(convertedData.length / itemsPerPage)

  $: paginatedData = convertedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page
    }
  }
</script>

{#if pagination}
  <div class="pagination">
    <Button90 disabled={currentPage === 1} addInfo="First" icon={Icons.First} buttonConfig={{ buttonText: 'First', clickCallback: () => goToPage(1), selected: false }} />
    <Button90 disabled={currentPage === 1} addInfo="Previous" icon={Icons.Previous} buttonConfig={{ buttonText: 'Previous', clickCallback: () => goToPage(currentPage - 1), selected: false }} />
    <Button90 disabled={currentPage === totalPages} addInfo="Next" icon={Icons.Next} buttonConfig={{ buttonText: 'Next', clickCallback: () => goToPage(currentPage + 1), selected: false }} />
    <Button90 disabled={currentPage === totalPages} addInfo="Last" icon={Icons.Last} buttonConfig={{ buttonText: 'Last', clickCallback: () => goToPage(totalPages), selected: false }} />
    <span>Page {currentPage} of {totalPages}</span>
  </div>
{/if}
<table>
  <thead>
    <tr>
      {#each Object.keys(pagination ? paginatedData[0] : convertedData[0] || {}) as column}
        <th>{column.toUpperCase()}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each pagination ? paginatedData : convertedData as row}
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
  .pagination {
    margin-top: 1em;
    padding: 1em;
    color: var(--main-text-color);
    display: flex;
    align-items: center;
  }
</style>

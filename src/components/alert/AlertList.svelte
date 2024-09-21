<script lang="ts">
  import { fade } from 'svelte/transition'
  import { alertStore, clearAlerts } from '../../stores/alertHandler'
  import { alertColors } from '../../style/defaultColors'
  import { Icons } from '../../style/icons'
  import Button90 from '../menu/Button90.svelte'
  import Page from '../page/page.svelte'
  import AlertListItem from './AlertListItem.svelte'
</script>

<Page>
  {#if $alertStore.length}
    <Button90
      icon={Icons.Delete}
      addInfo="Clear Log"
      buttonConfig={{
        buttonText: 'Clear Log',
        clickCallback: () => {
          clearAlerts()
        },
        selected: false,
      }}
    />
    <ul>
      <li class="listHeader">Messages: {$alertStore.length}</li>
      {#each $alertStore as alert, i}
        <AlertListItem {alert} />
      {/each}
    </ul>
  {:else}
    <p>Nothing logged yet - Thats good I guess?</p>
  {/if}
</Page>

<style>
  .listHeader {
    opacity: 0.8;
    font-size: 14px;
  }
  ul {
    min-width: 30%;
    list-style-type: none;
    border-left: 1px solid var(--main-accent2-color);
    padding-left: 1em;
  }
</style>

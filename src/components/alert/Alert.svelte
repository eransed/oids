<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import { addAlert, alertStore, handleAlertTimeOut } from './alertHandler'
  import AlertItem from './AlertItem.svelte'
  import { timeOutList } from './alertHandler'
  import Button90 from '../menu/Button90.svelte'
  import { Icons } from '../../style/icons'
  import { navigate } from 'svelte-routing'

  const baseBottom = 0
  const paddingScaler = 10
  const sizeScaler = 10
  const nrOfVisibleAlerts = 5
  let isHovered = false

  function hoverOnAlertWrapper() {
    isHovered = true
    timeOutList.forEach((v) => clearTimeout(v))
    timeOutList.splice(0, timeOutList.length)
  }

  function resetAlertTimers(timeOutMultiplier = 500) {
    isHovered = false
    setTimeout(() => {
      $alertStore
        .filter((v) => v.active)
        .forEach((alert, i) => {
          handleAlertTimeOut((i + 1) * timeOutMultiplier, alert)
        })
    }, 2000)
  }

  function closeAll() {
    $alertStore.filter((v) => v.active).forEach((v) => (v.active = false))
  }

  //
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="alertWrapper" in:fade={{ duration: 500 }} class:hovering={isHovered} on:mouseenter={() => hoverOnAlertWrapper()} on:mouseleave={() => resetAlertTimers()}>
  {#each $alertStore
    .filter((v) => v.active)
    .filter((v, i) => i < nrOfVisibleAlerts)
    .reverse() as alert, i}
    {@const alertLength = $alertStore.filter((v) => v.active).filter((v, i) => i < nrOfVisibleAlerts).length}
    {@const spacing = baseBottom - (i - alertLength) * paddingScaler}
    {@const scaleSize = 1.1 - (alertLength - i) / sizeScaler}
    <AlertItem {alert} {spacing} {scaleSize} {isHovered} clickCloseCallback={() => (alert.active = false)} />
  {/each}
  {#if isHovered && $alertStore.filter((v) => v.active).length > 0}
    <div class="alertFunctions">
      <Button90
        addInfo="Go to alerts"
        icon={Icons.Alert}
        buttonConfig={{
          buttonText: 'Go to alerts',
          clickCallback: () => {
            navigate('/alerts')
          },
          selected: false,
        }}
      />
      <Button90
        addInfo="Close all"
        icon={Icons.Cancel}
        buttonConfig={{
          buttonText: 'Close all',
          clickCallback: () => {
            closeAll()
            isHovered = false
          },
          selected: false,
        }}
      />
    </div>
  {/if}
</div>

<style>
  .alertWrapper {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5em;
  }

  .hovering {
    position: absolute;
    right: 0;
    bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    transition: all 350ms ease-in-out;
    width: fit-content;
    height: 100vh;
    justify-content: flex-end;
    z-index: 100;
  }

  .alertFunctions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>

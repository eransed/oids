<script lang="ts">
  import { fade } from 'svelte/transition'
  import { alertColors } from '../../style/defaultColors'
  import type { AlertType } from './AlertType'

  export let alert: AlertType

  $: color = alert.active ? 'black' : alertColors[alert.severity]
</script>

<li in:fade={{ duration: 150 }} style="color: {color};" class={alert.active ? 'active' : ''}>
  <span class="info">{alert.timeStamp.toLocaleString()} ({alert.severity}):</span>
  {alert.text}
</li>

<style>
  li {
    transition: all 500ms;
  }

  li:hover {
    transform: scale(1.2);
    background-color: black;
  }

  .active {
    background-color: var(--main-accent-color);
    color: black;
    transform: scale(1.2);
    transition: all 500ms;
  }

  .info {
    font-size: 0.8em;
    opacity: 0.7;
  }
</style>

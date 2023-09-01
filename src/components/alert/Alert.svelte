<script lang="ts">
  /**
   * @param severity - error, warning, info, success
   * @description An alert popup with different colors
   */
  export let severity: 'error' | 'warning' | 'info' | 'success' = 'info'

  const colors = {
    error: '#fdeded',
    warning: '#fff4e5',
    info: '#e5f6fd',
    success: '#edf7ed',
  }

  const color = colors[severity]

  console.log(color)
</script>

<div style="display: grid">
  <div class="alertBox" style="--theme-color: {color}">
    <p><b>{severity.toUpperCase()}</b></p>
    <p><slot /></p>
  </div>
</div>

<style>
  .alertBox {
    position: fixed;
    justify-self: center;
    background-color: var(--theme-color);
    padding: 1em;
    min-width: 200px;
    font-size: 12px;
    border-radius: 0.8em;
    z-index: 2;
    opacity: 0.9;
    top: 25%;
  }

  .alertBox p {
    padding: 0.2em;
  }
</style>

<script lang="ts">
  export let celebrationText: string
  export let celebrationTimeoutCallback: () => void

  setTimeout(() => {
    celebrationTimeoutCallback()
  }, 3000)
</script>

<div style="z-index: 2;">
  <h1>Congratulations!</h1>
  <p>{celebrationText}</p>
</div>

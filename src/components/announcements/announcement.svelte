<script lang="ts">
  export let header: string
  export let text: string
  export let timeOutCallBack: () => void

  setTimeout(() => {
    timeOutCallBack()
  }, 3000)
</script>

<div style="z-index: 2;">
  <h1>{header}</h1>
  <p>{text}</p>
</div>

<script lang="ts">
</script>

<div class="circle" />

<style>
  .circle {
    width: 25px;
    height: 25px;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(47, 167, 252, 0.5);
    border-right-color: rgb(47, 167, 252, 0);
    border-radius: 50%;
    animation-name: spin;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    margin: auto;
  }

  @keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
</style>

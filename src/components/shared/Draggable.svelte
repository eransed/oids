<script>
  export let left = 100;
  export let top = 100;
  export let isDraggable = false;

  let moving = false;

  function onMouseDown() {
    if (isDraggable) {
      moving = true;
    }
  }

  function onMouseMove(e) {
    if (moving) {
      left += e.movementX;
      top += e.movementY;
    }
  }

  function onMouseUp() {
    moving = false;
  }

  // 	$: console.log(moving);
</script>

<style>
  .draggable {
    user-select: none;
    cursor: move;
    border: solid 1px gray;
    position: absolute;
  }
</style>

<div
  on:mousedown={onMouseDown}
  style="left: {left}px; top: {top}px;"
  class="draggable"
>
  <slot />
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<div class="menuWrapper">
  <slot />
</div>

<style>
  :root {
    --color: rgb(99, 136, 179, 1);
    --opacity: 0.6;
  }

  .menuWrapper {
    position: relative;
    inset: 0;
    margin: auto;
    zoom: 1.5;
    padding: 20px;
    /* max-width: 300px; */
    width: fit-content;
    height: fit-content;
    list-style-type: none;
    opacity: 0.85;
    text-align: center;
    border-radius: 4px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--color);
    /* outline: 2px solid rgb(36, 22, 159);
    background: rgb(25, 0, 255, 0.1);
    box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -webkit-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -moz-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity)); */
    z-index: 1;
    color: #fff;
  }
</style>

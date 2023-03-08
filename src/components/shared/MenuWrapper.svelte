<style>
  :root {
    --color: rgb(99, 136, 179, 1);
    --opacity: 0.6;
  }

  .menuWrapper {
    zoom: 1.5;
    padding: 20px;
    min-width: 250px;
    min-height: fit-content;
    list-style-type: none;
    position: absolute;
    opacity: 0.8;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    border-radius: 4px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--color);
    outline: 2px solid rgb(36, 22, 159);
    background: rgb(25, 0, 255, 0.1);
    box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -webkit-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    -moz-box-shadow: -1px 1px 86px 0px rgba(0, 41, 255, var(--opacity));
    z-index: 1;
    color: #fff;
  }
</style>

<div class="menuWrapper">
  <slot />
</div>

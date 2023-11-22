<script lang="ts">
  //Imports
  import Button90 from './Button90.svelte'
  import type { Button90Config } from '../../interfaces/menu'
  import MenuWrapper from './MenuWrapper.svelte'

  //Exports
  export let buttons: Button90Config[]
  export let menuHeader: string = 'Menu'
</script>

<MenuWrapper>
  <ul class="buttonList">
    <h3 class="menuHeader">{menuHeader}</h3>
    {#each buttons as button}
      <li class="button">
        <Button90 borderBottom buttonConfig={button} />
      </li>
    {/each}
  </ul>
</MenuWrapper>

<style>
  :root {
    --color: rgb(99, 136, 179, 1);
    --outlineColor: rgb(36, 22, 159);
    --opacity: 0.6;
  }

  .buttonList {
    width: 100%;
    list-style: none;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    z-index: 1;
  }

  .buttonList li {
    width: 95%;
    margin-top: 0.5em;
  }

  .menuHeader {
    text-transform: uppercase;
    font-size: 12px;
    color: var(--main-text-color);
  }

  .buttonList:hover > .button {
    opacity: 0.6;
    transition: all;
    transition-duration: 0.5s;
  }

  .buttonList:hover .button:hover {
    opacity: 1;
    transition: all;
    transition-duration: 0.5s;
  }

  .buttonList .button {
    transition: all;
    transition-duration: 0.5s;
  }
</style>

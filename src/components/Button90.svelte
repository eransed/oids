<script lang="ts">
  import type { Button90Config } from "./interface"


//Name explained: Tribute to 90's game button styles

export let buttonConfig: Button90Config = {
    buttonText: '',
    clickCallback: () => {console.error('Callback not implemented')},
    selected: false,
}

</script>

<style>

    button{
        border: solid;  
        padding: 20px;
        margin: 10px;
        min-width: 150px;
    }

    .notSelected{
        background-color: transparent;
        color: #fff;
        opacity: 0.5;
    }
    .selected{
        background-color: #fff;
        color: #000;
        border: solid;
        border-color: #ccc;
    }
    
</style>

<div>
    {#if buttonConfig.selected}
        <button class="selected" on:click={buttonConfig.clickCallback}>{buttonConfig.buttonText}</button>
    {:else}
        <button class='notSelected' on:click={buttonConfig.clickCallback}>{buttonConfig.buttonText}</button>
    {/if}
</div>
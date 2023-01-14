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
        /* border: solid; */
        padding: 15px;
        margin: 5px;
        min-width: 180px;
        height: 60px;
        /* font-family: 'Courier New', Courier, monospace; */
        /* font-family: 'Times New Roman', Times, serif; */
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        
        font-weight: bold;
        font-size: 15px;
    }
    
    .notSelected{
        background-color: transparent;
        color: #fff;
        opacity: 0.5;
    }
    .selected{
        background-color: #fff;
        color: #000;
        text-decoration-line: underline;
        font-weight: bold;
        font-size: 17px;
        font-stretch: expanded;
        /* border: solid; */
        /* border-color: #ccc; */
    }
    
</style>

<div>
    {#if buttonConfig.selected}
        <button class="selected" on:click={buttonConfig.clickCallback}>{buttonConfig.buttonText}</button>
    {:else}
        <button class='notSelected' on:click={buttonConfig.clickCallback}>{buttonConfig.buttonText}</button>
    {/if}
</div>
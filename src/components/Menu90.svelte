<script lang="ts">
    import Button90 from "./Button90.svelte"
    import type { Button90Config } from "./interface"
    export let buttons: Button90Config[]

    //Should maybe be local for this component, this?
    
    const rotate = (index: number, size: number): number => {
        return index % size
    }


    document.addEventListener('keydown', (event) => {

        let direction = 1

       

        if (event.code === 'ArrowUp') {
            
        } else if (event.code === 'ArrowDown') {
            direction=-1
        } else return

       
        buttons.forEach((b,index) => {
            if (b.selected) {

                let i = (index-direction)%buttons.length+direction

                buttons[i].selected = true
                b.selected = false
                console.log(b, i)
                return
            }

            buttons[0].selected = true

        })
    })


</script>


<style>
    .wrapper{
        color: #fff;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .buttonList{
        list-style-type: none;
    }

</style>

<div class="wrapper">
    <ul class='buttonList'>
    {#each buttons as button} 
    
    <li><Button90 buttonConfig={button}/></li>
            
    {/each}
    </ul>
</div>
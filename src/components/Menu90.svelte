<script lang="ts">
    import Button90 from "./Button90.svelte"
    import type { Button90Config } from "./interface"
    export let buttons: Button90Config[]

    //Should maybe be local for this component, this?
    
    const rotate = (index: number, size: number): number => {
        if (index < 0) return (size + index % size) % size
        return index % size
    }

    function handleMenuSelection(event: KeyboardEvent) {
        let selectedIndex = 0

        buttons.forEach((b, index) => {
            if (b.selected) {
                selectedIndex = index
                return
            }
            // No selected button, default to the first one
            buttons[0].selected = true
        })
        
        buttons.forEach(b => {
            b.selected = false
        })
        
        if (event.code === 'ArrowUp') {
            selectedIndex--
        } else if (event.code === 'ArrowDown') {
            selectedIndex++
        } else if (event.code === 'Enter') {
            buttons[selectedIndex].clickCallback()
        }
            
        selectedIndex = rotate(selectedIndex, buttons.length)
        buttons[selectedIndex].selected = true
    }
    
    document.addEventListener('keydown', (event) => {
        console.log('code =', event.code, ', key =',event.key)
        handleMenuSelection(event)
    })

</script>


<style>

    .buttonList{
        list-style-type: none;
        border: 2px solid #fff;
    }

</style>


    <ul class='buttonList'>
    {#each buttons as button} 
        <li><Button90 buttonConfig={button}/></li>    
    {/each}
    </ul>


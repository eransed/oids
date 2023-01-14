<script lang="ts">
// TODO: welcome menu with choice of playing single player or multiplayer
//     Create a game or join an already existing lobby
//     Then go forward to step 2
// TODO
// If singleplayer: start game
// If multiplayer: 1. Initiate a new lobby or join an existing one
// 2. Let people fly around in 'practice mode' before game starts
// 3. When game starts (pressed lobby button go) add a countdown then initiate multiplayer

import type { Button90Config } from "./interface"
import Menu90 from "./Menu90.svelte"

    let menuItems: Button90Config[] = [
    {
        buttonText: 'Singleplayer',
        clickCallback: () => {console.log('Singleplayer')},
        selected: true,
    },
    {
        buttonText: 'Multiplayer', 
        clickCallback: () => {alert('Multiplayer');console.log('Multiplayer')},
        selected: false,
    },
    {
        buttonText: 'Settings', 
        clickCallback: () => {console.log('Settings')},
        selected: false,
    },
    {
        buttonText: 'About', 
        clickCallback: () => {console.log('About')},
        selected: false,
    }]

</script>

<style>

.wrapper{
    display: flex;
    justify-content: center;
}

</style>

<div class='wrapper'>
    <Menu90 buttons={menuItems}/>
</div>

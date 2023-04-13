<script lang='ts'>
    //Svelte
    import { onMount } from "svelte"

    //Components
    import Header from "./header.svelte"
    import Game from "./Game.svelte";

    //Stores
    import { user } from "../lib/stores";

    //Interfaces
    import type { User } from "./interface"

    //Services
    import { validateToken } from "../lib/services/utils/Token"

    //Utils
    import { rndi } from "../lib/math";

    let userData: User | undefined

    user.subscribe((v) => {
        userData = v
    })

    onMount(() => {
        validateToken()
    })

    let welcomeMessage = 'Welcome to OIDS ' + `${userData ? userData?.name : 'Player'}`
    let typeWriterText = ''
    let i = 0
    

    const typeWriter = (speed: number): void =>  {
        setTimeout(() => {
            
            if (i < welcomeMessage.length) {
                typeWriterText += welcomeMessage.charAt(i)
            i++
            }
            typeWriter(rndi(100, 200))
        }, speed)

    }

    typeWriter(300)


</script>

<style>
.wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    color: #fff;
    width: 100vw;
    height: 100vh;
    font-family: 'Courier New', Courier, monospace;
}
</style>

<Header/>

<div class="wrapper">
    {typeWriterText}
</div>

<!-- <Game/> -->
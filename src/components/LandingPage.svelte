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

    let userName = userData ? userData?.name : `Player ${rndi(1,100)}`

    let welcomeMessage = `Welcome to OIDS ${userName} \r Wanna play a game?`
    let typeWriterText = ''
    let i = 0
    let removeText = false

    const typeWriter = (speed: number): void =>  {

        setTimeout(() => {
            
            if (i < welcomeMessage.length && !removeText) {
                typeWriterText += welcomeMessage.charAt(i)
                i++
                typeWriter(rndi(100, 200))
                if (i === welcomeMessage.length) {
                    removeText = true
                    
                }
                
            }
            //     else if (removeText && i > welcomeMessage.length - userName.length) {
            //     typeWriterText = typeWriterText.substring(0, typeWriterText.length - 1)
            //     typeWriter(rndi(100, 200))
            //     if (i === welcomeMessage.length - userName.length + 1) {
            //         removeText = false
            //     }
            //     i--
            // }
            
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
    height: 100vh;
    width: 100vw;
    font-family: 'Courier New', Courier, monospace;
}

.game{
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0
}
</style>

<Header/>

<div class="game">
    <Game/>
</div>


<div class="wrapper">
    {typeWriterText}
</div>


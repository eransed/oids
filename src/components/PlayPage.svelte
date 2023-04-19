<script lang='ts'>
    //Svelte
    import { onMount } from "svelte"

    //Components


    //Stores
    import { user } from "../lib/stores";

    //Interfaces
    import type { User } from "./interface"

    //Utils
    import { rndi } from "../lib/math";

    let userData: User | undefined

    user.subscribe((v) => {
        userData = v
    })


    let welcomeMessage = `This is the Play page!`
    let typeWriterText = ''
    let i = 0
    let removeText = false

    const typeWriter = (speed: number): void =>  {

        setTimeout(() => {
            
            if (i < welcomeMessage.length && !removeText) {
                typeWriterText += welcomeMessage.charAt(i)
                i++
                typeWriter(rndi(50, 75))
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


</style>


<div class="wrapper">
    {typeWriterText}
    
</div>


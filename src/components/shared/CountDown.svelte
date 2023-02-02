<script lang='ts'>
  import { timer, time, isRunning, isComplete } from "./countdownTimer";
  export let title: string = ''
  export let countFrom: number = 0 
  export let countDownCallBack: () => void = () => {}

  if (countFrom) {
    timer.setCountFrom(countFrom)
  }

  isComplete.subscribe((value) => {
    if (value) {
        countDownCallBack()
    }
  })

  timer.start()

</script>

<style>
    #timer {
    background-color: #eee;
    border-radius: 8px;
    position: fixed;
    width: 20%;
    text-align: center;
    top: 25%;
    left: 50%;
    padding: 20px;
    transform: translate(-50%, 0);
    z-index: 100;
    color: #000;
    }



</style>

<div id="timer">
        <h2>{title}</h2>
        <h1>{$time}</h1>  
</div>
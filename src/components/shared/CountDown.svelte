<script lang="ts">
  import { timer, time, isRunning, isComplete } from './countdownTimer'
  import Modal from './Modal.svelte'
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

<Modal>
  <h2>{title}</h2>
  <h1>{$time}</h1>
</Modal>

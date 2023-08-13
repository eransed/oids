<script lang="ts">
  import { MessageType } from "../../../../lib/interface"
  import { localPlayerStore } from "../Game/Utils/gameUtils"

  function prettySpaceObjectValue(value: unknown, key=''): string {
    // let out: string = ':' + (typeof value) + ' = '
    // const valType = (typeof value)
    let out = ''
    if (typeof value === 'object') {
      Object.entries(<object>value).forEach((v) => {
        out += `${v[0]}: ${prettySpaceObjectValue(v[1])}, `
      })
      out = out.substring(0, out.length - 2)
      return out
    } else if (key === 'messageType') {
      return MessageType[<number>value]
    }
    return out + value
  }

  function getObjectPropCountIfAny(obj: unknown): string {
    if (typeof obj === 'object') {
      const propCount = Object.keys(<Object>obj).length
      if (propCount > 0) return `[${propCount}]`
    }
    return ''
  }

</script>

<style>
  
  h6 {
    display: inline-block;
    margin-left: 40%;
    width: 100%;
  }

  div, .left, .right {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.1rem;
    padding-top: 0;
    font-size: 0.6rem;
    max-width: 35rem;
    min-width: 35rem;
    /* overflow-y: auto; */
  }

  .left {
    float: left;
  }

  .right {
    float: right;
  }

</style>

<h6>{$localPlayerStore.name} [{Object.keys($localPlayerStore).length}]</h6>
<div>

  {#each Object.entries($localPlayerStore) as kv, index}
  <div><span style="color: {$localPlayerStore.color}">[{index + 1}].{kv[0]}</span>{getObjectPropCountIfAny(kv[1])} = {prettySpaceObjectValue(kv[1], kv[0])}</div>
  {/each}

</div>

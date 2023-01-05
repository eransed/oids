import { round2dec } from './math'
import { renderFrameInfo } from './render'

const fps_list_max_entries = 12
let prevTimestamp: number
const fps_list: number[] = []

export function getFrameTimeMs(timestamp: number): number {
  // todo: make sure not to return nan
  const frameTime = timestamp - prevTimestamp
  prevTimestamp = timestamp
  return frameTime
}

export function fpsCounter(frameTimeMs: number, ctx: CanvasRenderingContext2D): void {
  const fps = round2dec(1000 / frameTimeMs, 0)
  const dt = round2dec(frameTimeMs, 0)
  fps_list.push(fps)
  if (fps_list.length >= fps_list_max_entries) {
    const afps: number = round2dec(fps_list.reduce((prev, cur) => prev + cur, 0) / fps_list_max_entries, 0)
    renderFrameInfo(afps, dt, ctx)
    fps_list.shift()
  } else {
    renderFrameInfo(fps, dt, ctx)
  }
}

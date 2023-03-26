
import { linearTransform, round2dec } from "./math"
import { setScaledFont } from "./render"
import type { Vec2d } from "./types"

const defaultSize = 50

export interface DataStats {
  data: number[],
  maxSize: number,
  accumulated: number,
  baseUnit: string,
  accUnit: string,
  label: string,
}

export function addDataPoint(dataStats: DataStats, dp: number): void {
  dataStats.accumulated+=dp
  dataStats.data.push(dp)
  if (dataStats.data.length > dataStats.maxSize) {
    dataStats.data.shift()
  }
}

export function getLatestValue(ds: DataStats): number {
  return ds.data[ds.data.length - 1]
}

export function getAverage(ds: DataStats): number {
  return ds.data.reduce((prev, cur) => prev + cur, 0) / ds.data.length
}

export function getMin(ds: DataStats): number {
  return  ds.data.reduce((a, b) => Math.min(a, b), Infinity)
}

export function getMax(ds: DataStats): number {
  return  ds.data.reduce((a, b) => Math.max(a, b), -Infinity)
}

export function newDataStats(): DataStats {
  return {
    data: [],
    maxSize: defaultSize,
    accumulated: 0,
    baseUnit: '',
    accUnit: '',
    label: '',
  }
}

export function siPretty(value: number, baseUnit = ''): string {
  const Y = 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000
  const Z = 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000
  const E = 1000 * 1000 * 1000 * 1000 * 1000 * 1000
  const P = 1000 * 1000 * 1000 * 1000 * 1000
  const T = 1000 * 1000 * 1000 * 1000
  const G = 1000 * 1000 * 1000
  const M = 1000 * 1000
  const K = 1000
  if (value >= Y) return `${round2dec(value/Y, 2)} Y${baseUnit}`
  if (value >= Z) return `${round2dec(value/Z, 2)} Z${baseUnit}`
  if (value >= E) return `${round2dec(value/E, 2)} E${baseUnit}`
  if (value >= P) return `${round2dec(value/P, 2)} P${baseUnit}`
  if (value >= T) return `${round2dec(value/T, 2)} T${baseUnit}`
  if (value >= G) return `${round2dec(value/G, 2)} G${baseUnit}`
  if (value >= M) return `${round2dec(value/M, 1)} M${baseUnit}`
  if (value >= K) return `${round2dec(value/K, 0)} K${baseUnit}`
  return `${round2dec(value, 0)} ${baseUnit}`
}

export function renderGraph(ds: DataStats, topLeft: Vec2d, size: Vec2d, ctx: CanvasRenderingContext2D): void {
  // const st = performance.now()
  ctx.save()
  ctx.translate(topLeft.x, topLeft.y)
  const thickLine = 5
  const thinLine = 3
  const edgePad = 10
  const minRenderDist = 32
  const value = getLatestValue(ds)
  const min = getMin(ds)
  const max = getMax(ds)
  const a = getAverage(ds)
  const spread = max-min
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.lineWidth = thickLine
  setScaledFont(ctx)
  ctx.strokeRect(0, 0, size.x, size.y)
  // ctx.fillText(`Value: ${siPretty(value, ds.baseUnit)}`, size.x + 30, 25 + 0)
  // ctx.fillText(`Aver: ${siPretty(a, ds.baseUnit)}`, size.x + 30, 25 + 50)
  // ctx.fillText(`Max: ${siPretty(max, ds.baseUnit)}`, size.x + 30, 25 + 100)
  // ctx.fillText(`Min: ${siPretty(min, ds.baseUnit)}`, size.x + 30, 25 + 150)
  // ctx.fillText(`Spread: ${siPretty(spread, ds.baseUnit)}`, size.x + 30, 25 + 200)
  // ctx.fillText(`Acc: ${siPretty(ds.accumulated, ds.accUnit)}`, size.x + 30, 25 + 250)
  // ctx.fillText(`Data: ${ds.data.length}/${ds.maxSize}`, size.x + 30, 25 + 300)
  // ctx.fillText(`${ds.label}`, Math.floor(size.x/2) - (ds.label.length*10), -30)
  // ctx.fillText(`[t]`, Math.floor(size.x/2) - 10, size.y + 30)
  
  const leftPad = -300

  const yval = linearTransform(value, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  ctx.fillText(`${siPretty(value, ds.baseUnit)}`, size.x + 40, 10 + yval)
  ctx.fillRect(size.x, yval, 30, thickLine)

  const yaver = linearTransform(a, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  ctx.fillText(`a: ${siPretty(a, ds.baseUnit)}`, leftPad, 10 + yaver)
  ctx.fillRect(-30, yaver, 30, thickLine)

  const ymax = linearTransform(max, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  if (ymax + minRenderDist < yaver) {
    ctx.fillText(`h: ${siPretty(max, ds.baseUnit)}`, leftPad, 10 + ymax)
    ctx.fillRect(-30, ymax, 30, thickLine)
  }

  const ymin = linearTransform(min, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  if (ymin - minRenderDist > yaver) {
    ctx.fillText(`l: ${siPretty(min, ds.baseUnit)}`, leftPad, 10 + ymin)
    ctx.fillRect(-30, ymin, 30, thickLine)
  }

  const points: Vec2d[] = []

  ds.data.forEach((n, i) => {
    const xmap = linearTransform(i, 0, ds.maxSize, edgePad, size.x - edgePad)
    const ymap = linearTransform(n, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
    points.push({x: xmap, y: ymap})
  })

  ctx.fillStyle = '#fff'

  if (points.length > 1) {
    ctx.lineWidth = thinLine
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
  } else {
    points.forEach((v) => {
      ctx.fillRect(v.x, v.y, edgePad, thickLine)
    })
  }
  // ctx.fillText(`Render t: ${round2dec(performance.now() -st, 0)} ms`, size.x + 30, 25 + 350)
  ctx.restore()
}

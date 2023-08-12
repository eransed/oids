import { linearTransform, round2dec, type Vec2d } from 'mathil'
import { setScaledFont } from './render/render2d'

const defaultSize = 700

export interface DataStats {
  data: number[]
  maxSize: number
  accumulated: number
  baseUnit: string
  accUnit: string
  label: string
  prettyPrint: (v: number, s: string) => string
}

export function addDataPoint(dataStats: DataStats, dp: number): void {
  dataStats.accumulated += dp
  dataStats.data.push(dp)
  if (dataStats.data.length > dataStats.maxSize) {
    dataStats.data.shift()
  }
}

export function getLatestValue(ds: DataStats, defaultValueIfNaN = 0): number {
  const val = ds.data[ds.data.length - 1]
  if (isNaN(val)) return defaultValueIfNaN
  return val
}

export function getAverage(ds: DataStats): number {
  return ds.data.reduce((prev, cur) => prev + cur, 0) / ds.data.length
}

export function getMin(ds: DataStats): number {
  return ds.data.reduce((a, b) => Math.min(a, b), Infinity)
}

export function getMax(ds: DataStats): number {
  return ds.data.reduce((a, b) => Math.max(a, b), -Infinity)
}

export const GRAPHS: DataStats[] = []

export function newDataStats(): DataStats {
  const nds = {
    data: [],
    maxSize: defaultSize,
    accumulated: 0,
    baseUnit: '',
    accUnit: '',
    label: '',
    prettyPrint: siPretty,
  }
  GRAPHS.push(nds)
  return nds
}

export function msPretty(ms: number): string {
  const D = 24 * 60 * 60 * 1000
  const H = 60 * 60 * 1000
  const M = 60 * 1000
  const S = 1000
  if (ms >= D) return `${round2dec(ms / D, 2)} d`
  if (ms >= H) return `${round2dec(ms / H, 1)} h`
  if (ms >= M) return `${round2dec(ms / M, 1)} m`
  if (ms >= S) return `${round2dec(ms / S, 1)} s`
  return `${round2dec(ms, 0)} ms`
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
  if (value >= Y) return `${round2dec(value / Y, 2)} Y${baseUnit}`
  if (value >= Z) return `${round2dec(value / Z, 2)} Z${baseUnit}`
  if (value >= E) return `${round2dec(value / E, 2)} E${baseUnit}`
  if (value >= P) return `${round2dec(value / P, 2)} P${baseUnit}`
  if (value >= T) return `${round2dec(value / T, 2)} T${baseUnit}`
  if (value >= G) return `${round2dec(value / G, 2)} G${baseUnit}`
  if (value >= M) return `${round2dec(value / M, 2)} M${baseUnit}`
  if (value >= K) return `${round2dec(value / K, 2)} K${baseUnit}`
  return `${round2dec(value, 0)} ${baseUnit}`
}

export function renderGraph(ds: DataStats, topLeft: Vec2d, size: Vec2d, ctx: CanvasRenderingContext2D): void {
  // const st = performance.now()
  ctx.save()
  ctx.translate(topLeft.x, topLeft.y)
  const thickLine = 5
  const thinLine = 3
  const edgePad = 10
  const minRenderDist = 30
  const value = getLatestValue(ds)
  const min = getMin(ds)
  const max = getMax(ds)
  const a = getAverage(ds)
  const spread = ds.prettyPrint(max - min, ds.baseUnit)
  ctx.fillStyle = '#fff'
  ctx.lineWidth = thinLine
  ctx.strokeStyle = '#777'
  setScaledFont(ctx)
  ctx.strokeRect(0, 0, size.x, size.y)
  // ctx.fillText(`Value: ${ds.prettyPrint(value, ds.baseUnit)}`, size.x + 30, 25 + 0)
  // ctx.fillText(`Aver: ${ds.prettyPrint(a, ds.baseUnit)}`, size.x + 30, 25 + 50)
  // ctx.fillText(`Max: ${ds.prettyPrint(max, ds.baseUnit)}`, size.x + 30, 25 + 100)
  // ctx.fillText(`Min: ${ds.prettyPrint(min, ds.baseUnit)}`, size.x + 30, 25 + 150)
  // ctx.fillText(`Spread: ${ds.prettyPrint(spread, ds.baseUnit)}`, size.x + 30, 25 + 200)
  // ctx.fillText(`Acc: ${ds.prettyPrint(ds.accumulated, ds.accUnit)}`, size.x + 30, 25 + 250)
  // ctx.fillText(`Data: ${ds.data.length}/${ds.maxSize}`, size.x + 30, 25 + 300)
  // ctx.fillText(`${ds.label}`, Math.floor(size.x/2) - (ds.label.length*10), -30)
  // ctx.fillText(`[t]`, Math.floor(size.x/2) - 10, size.y + 30)

  const leftPad = -350

  const yval = linearTransform(value, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  const yaver = linearTransform(a, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  ctx.fillText(`${ds.prettyPrint(value, ds.baseUnit)}`, size.x + 40, 10 + yaver)
  ctx.fillRect(size.x, yval, 30, thinLine)

  ctx.fillStyle = '#88e'
  ctx.fillText(`Av: ${ds.prettyPrint(a, ds.baseUnit)}`, leftPad, 10 + yaver)
  ctx.fillRect(-30, yaver, size.x + 30, thinLine)

  const ymax = linearTransform(max, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  ctx.fillStyle = '#e00'
  ctx.fillRect(-30, ymax, size.x + 30, thinLine)
  if (ymax + minRenderDist < yaver) {
    ctx.fillText(`Hi: ${ds.prettyPrint(max, ds.baseUnit)}`, leftPad, 10 + ymax)
  }

  const ymin = linearTransform(min, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
  ctx.fillStyle = '#0e0'
  ctx.fillRect(-30, ymin, size.x + 30, thinLine)
  if (ymin - minRenderDist > yaver) {
    ctx.fillText(`Lo: ${ds.prettyPrint(min, ds.baseUnit)}`, leftPad, 10 + ymin)
  }

  const points: Vec2d[] = []

  ds.data.forEach((n, i) => {
    const xmap = linearTransform(i, 0, ds.maxSize, edgePad, size.x - edgePad)
    const ymap = linearTransform(n, min - edgePad, max + edgePad, size.y - edgePad, edgePad)
    points.push({ x: xmap, y: ymap })
  })

  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'

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
      ctx.fillRect(v.x, v.y, edgePad, thinLine)
    })
  }
  // ctx.fillText(`Render t: ${round2dec(performance.now() -st, 0)} ms`, size.x + 30, 25 + 350)
  ctx.fillStyle = '#0e0'
  const places = ds.data.length === ds.maxSize ? ` r=${spread}` : ` ${ds.data.length}/${ds.maxSize}`
  ctx.fillText(`${ds.label}${places}`, 0, -Math.floor(edgePad * 1.5))
  ctx.restore()
}

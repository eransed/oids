import { round2dec, type Vec2 } from 'mathil'
import { type SpaceObject } from '../interface'
import { renderShot } from './render2d'
import type { PlanetType, UIStyle } from '../interface'
import { orbitingScale } from '../constants'

interface SurfaceFeature {
  x: number
  y: number
  size: number
  color: string
}

export function renderPlanet(npc: SpaceObject, pos: Vec2, ctx: CanvasRenderingContext2D, style: UIStyle): void {
  const planet = getPlanet(npc.planetType)
  const surfaceDetails = planet.features

  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate((round2dec(90 + npc.angleDegree, 1) * Math.PI) / 180)

  ctx.fillText(`${npc.shotsInFlightNew.length}`, 0, 0)

  // Draw main planet circle
  const planetRadius = Math.sqrt(npc.size.x ** 2 + npc.size.y ** 2)
  ctx.beginPath()
  ctx.arc(0, 0, planetRadius, 0, Math.PI * 2)
  ctx.fillStyle = planet.color
  if (npc.lastDamagedByName.length > 0) {
    ctx.fillStyle = '#FFCCCC'
  }
  ctx.fill()
  ctx.closePath()

  // Draw surface details (lakes, mountains, craters, and ridges)
  for (const feature of surfaceDetails) {
    drawFeature(ctx, feature, planetRadius)
  }

  // Add depth effect
  ctx.shadowBlur = 15
  ctx.shadowColor = '#777777'
  ctx.strokeStyle = planet.color
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.closePath()

  // Draw orbit circle
  ctx.beginPath()
  ctx.arc(0, 0, npc.hitRadius + npc.orbitingAltitude, 0, Math.PI * 2)
  ctx.strokeStyle = '#AAAAAA'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.closePath()

  ctx.restore()

  // Draw shots
  renderShot(npc, ctx, style)
}

function drawFeature(ctx: CanvasRenderingContext2D, feature: SurfaceFeature, planetRadius: number): void {
  const scaledX = feature.x * (planetRadius / 150)
  const scaledY = feature.y * (planetRadius / 150)
  ctx.beginPath()
  ctx.arc(scaledX, scaledY, feature.size, 0, Math.PI * 2)
  ctx.fillStyle = feature.color
  ctx.fill()
  ctx.closePath()
}

export function getPlanet(type: PlanetType) {
  interface Planet {
    features: SurfaceFeature[]
    color: string
  }

  const planetList: Planet[] = [
    { features: TerraNovaFeatures, color: pastelEarthColor },
    { features: AresPrimeFeatures, color: pastelMarsColor },
    { features: NeptaraFeatures, color: pastelNeptuneColor },
    { features: VenaraFeatures, color: pastelVenusColor },
  ]

  return planetList[type]
}

// Pastel Earth details
export const TerraNovaFeatures: SurfaceFeature[] = [
  { x: -50, y: -30, size: 40, color: '#A0D8B3' }, // Lake
  { x: 70, y: 50, size: 35, color: '#B0E0E6' }, // Ocean
  { x: -30, y: 80, size: 25, color: '#C2B280' }, // Mountain
]
export const pastelEarthColor = '#C5E1A5'

// Pastel Mars details
export const AresPrimeFeatures: SurfaceFeature[] = [
  { x: -20, y: -10, size: 25, color: '#E57373' }, // Crater
  { x: 30, y: 40, size: 30, color: '#D7CCC8' }, // Ridge
  { x: -10, y: 50, size: 20, color: '#A1887F' }, // Canyon
]
export const pastelMarsColor = '#EF9A9A'

// Pastel Neptune details
export const NeptaraFeatures: SurfaceFeature[] = [
  { x: 30, y: -20, size: 35, color: '#90CAF9' }, // Ice patch
  { x: -50, y: 30, size: 30, color: '#64B5F6' }, // Storm
  { x: 20, y: 60, size: 25, color: '#42A5F5' }, // Swirl
]
export const pastelNeptuneColor = '#BBDEFB'

// Pastel Venus details
export const VenaraFeatures: SurfaceFeature[] = [
  { x: -40, y: 10, size: 30, color: '#FFCC80' }, // Lava Flow
  { x: 60, y: 50, size: 28, color: '#FFB74D' }, // Volcano
  { x: -30, y: -40, size: 26, color: '#FFA726' }, // Mountain Range
]
export const pastelVenusColor = '#FFECB3'

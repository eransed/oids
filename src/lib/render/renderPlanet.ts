import { round2dec, type Vec2 } from 'mathil'
import type { Crater, PlanetType, SpaceObject } from '../interface'
import { renderShot } from './render2d'
import type { UIStyle } from '../interface'
import { orbitingScale } from '../constants'

export function renderPlanet(npc: SpaceObject, pos: Vec2, ctx: CanvasRenderingContext2D, style: UIStyle): void {
  if (!npc.planetType) {
    return
  }
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

  // Draw planetary features
  for (const feature of surfaceDetails) {
    const scaledX = feature.x * (planetRadius / 150) // Adjust based on planet size
    const scaledY = feature.y * (planetRadius / 150)
    drawFeature(ctx, scaledX, scaledY, feature.radius, feature.color)
  }

  // Add a shadow effect for depth
  ctx.beginPath()
  ctx.shadowBlur = 20
  ctx.shadowColor = '#555555'
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

function drawFeature(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

export function getPlanet(type: PlanetType) {
  interface Planet {
    features: Crater[] // Reusing Crater structure for surface features
    color: string
  }

  const planetList: Planet[] = [
    { features: lavaPlanetFeatures, color: lavaPlanetColor },
    { features: icePlanetFeatures, color: icePlanetColor },
    { features: junglePlanetFeatures, color: junglePlanetColor },
    { features: desertPlanetFeatures, color: desertPlanetColor },
  ]

  return planetList[type]
}

// Planet 1 - Lava Planet
export const lavaPlanetFeatures: Crater[] = [
  { x: -50, y: -30, radius: 40, color: '#FF4500' }, // Lava pool
  { x: 80, y: 40, radius: 25, color: '#D2691E' }, // Magma cracks
  { x: -30, y: 80, radius: 20, color: '#8B0000' }, // Volcanic ridge
]
export const lavaPlanetColor = '#662200'

// Planet 2 - Ice Planet
export const icePlanetFeatures: Crater[] = [
  { x: -20, y: -10, radius: 30, color: '#E0FFFF' }, // Frozen lake
  { x: 30, y: 40, radius: 20, color: '#ADD8E6' }, // Ice cliffs
  { x: -10, y: 50, radius: 15, color: '#B0E0E6' }, // Glacial valley
]
export const icePlanetColor = '#A9D0F5'

// Planet 3 - Jungle Planet
export const junglePlanetFeatures: Crater[] = [
  { x: 30, y: -20, radius: 35, color: '#228B22' }, // Dense forest
  { x: -50, y: 30, radius: 28, color: '#006400' }, // Thick vegetation
  { x: 20, y: 60, radius: 22, color: '#32CD32' }, // Alien flora
  { x: 10, y: -70, radius: 18, color: '#008000' }, // Jungle valley
  { x: -80, y: -30, radius: 26, color: '#2E8B57' }, // Mossy swamp
]
export const junglePlanetColor = '#556B2F'

// Planet 4 - Desert Planet
export const desertPlanetFeatures: Crater[] = [
  { x: -40, y: 10, radius: 25, color: '#C2B280' }, // Sand dunes
  { x: 60, y: 50, radius: 20, color: '#FFD700' }, // Golden sands
  { x: -30, y: -40, radius: 18, color: '#DAA520' }, // Oasis
  { x: 20, y: -20, radius: 22, color: '#DEB887' }, // Rocky outcrop
  { x: 40, y: -50, radius: 30, color: '#F4A460' }, // Dried riverbed
]
export const desertPlanetColor = '#D2B48C'

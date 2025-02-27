import { add2, newVec2 } from 'mathil'
import { createPlanet } from '../factory'
import { PlanetType, type SpaceObject } from '../interface'
import { worldStartPosition } from '../constants'

function AresPrime(sessionId: string): SpaceObject {
  const aresPrime = createPlanet(sessionId, add2(worldStartPosition, newVec2(-10000, 10000)), newVec2(500, 500), 'Tattooine')
  aresPrime.planetType = PlanetType.ARESPRIME

  console.log('Creating tattooine at: ', aresPrime.cameraPosition)

  return aresPrime
}

function Neptara(sessionId: string): SpaceObject {
  const neptara = createPlanet(sessionId, add2(worldStartPosition, newVec2(-2500, 2500)), newVec2(500, 500), 'Neptara')
  neptara.planetType = PlanetType.NEPTARA

  return neptara
}

function TerraNova(sessionId: string): SpaceObject {
  const terraNova = createPlanet(sessionId, add2(worldStartPosition, newVec2(-25000, 25000)), newVec2(500, 500), 'TerraNova')
  terraNova.planetType = PlanetType.TERRANOVA

  return terraNova
}

function Venara(sessionId: string): SpaceObject {
  const venara = createPlanet(sessionId, add2(worldStartPosition, newVec2(-5000, 5000)), newVec2(500, 500), 'Venara')
  venara.planetType = PlanetType.VENARA

  return venara
}

//Returning an array with defined planets
export function getPlanets(sessionId: string): SpaceObject[] {
  return [AresPrime(sessionId), Neptara(sessionId), TerraNova(sessionId), Venara(sessionId)]
}

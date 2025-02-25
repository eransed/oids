import { newVec2 } from 'mathil'
import { createPlanet } from '../factory'
import { PlanetType, type SpaceObject } from '../interface'

//Creating a planet
function Tattooine(sessionId: string): SpaceObject {
  const tattooine = createPlanet(sessionId, newVec2(1000, 1000), newVec2(500, 500), 'Tattooine')
  tattooine.planetType = PlanetType.DESERT

  console.log('Creating tattooine at: ', tattooine.cameraPosition)

  return tattooine
}

//Creating a planet
function Mayja(sessionId: string): SpaceObject {
  const mayja = createPlanet(sessionId, newVec2(-25000, -25000), newVec2(500, 500), 'Mayja')
  mayja.planetType = PlanetType.JUNGLE

  return mayja
}

//Returning an array with defined planets
export function getPlanets(sessionId: string): SpaceObject[] {
  return [Tattooine(sessionId), Mayja(sessionId)]
}

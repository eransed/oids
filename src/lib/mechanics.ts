import type { SpaceObject, Vec2d } from "./types"
import { wrap } from "./math"

export function applyEngine(so: SpaceObject): number {
  if (so.fuel > 0) {
    so.fuel -= so.enginePower
    return so.enginePower
  }
  so.fuel = 0
  console.log(so.name + " has no more fuel!", so)
  return 0
}

export function applySteer(so: SpaceObject): number {
  return so.steeringPower
}

export function wrapSpaceObject(so: SpaceObject, screen: Vec2d) {
  //wrap(so.position, screen)
  //To do: Make it appear where it entered..
  if (so.position.x < 0) {
    so.position.x = screen.x
  }
  if (so.position.x > screen.x) {
    so.position.x = 0
  }
  if (so.position.y < 0) {
    so.position.y = screen.y
  }
  if (so.position.y > screen.y) {
    so.position.y = 0
  }
}

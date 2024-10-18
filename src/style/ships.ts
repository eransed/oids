import { warn } from 'mathil'
import Retro from '../assets/ships/retro.svg'
import Ship from '../assets/ships/ship.svg'
import SpaceCraft from '../assets/ships/spaceCraft.svg'
import Viking from '../assets/ships/viking.svg'

//Image cache
export const RetroImg = new Image()
RetroImg.src = Retro

export const ShipImg = new Image()
ShipImg.src = Ship

export const SpaceCraftImg = new Image()
SpaceCraftImg.src = SpaceCraft

export const VikingImg = new Image()
VikingImg.src = Viking

export enum ShipVariant {
  Retro,
  Ship,
  SpaceCraft,
  Viking,
}

export interface ShipBundle {
  name: string
  img: HTMLImageElement
  type: ShipVariant
  svgUrl: string
}

export function createShipBundle(
  variant: ShipVariant = ShipVariant.Retro,
  shipImage: HTMLImageElement
): ShipBundle {
  return {
    name: '',
    img: shipImage,
    type: variant,
    svgUrl: shipImage.src,
  }
}

export const ShipBundles = {
  Retro: createShipBundle(ShipVariant.Retro, RetroImg),
  Ship: createShipBundle(ShipVariant.Ship, ShipImg),
  SpaceCraft: createShipBundle(ShipVariant.SpaceCraft, SpaceCraftImg),
  Viking: createShipBundle(ShipVariant.Viking, VikingImg),
}

export function getShipBundleCache(type: ShipVariant): ShipBundle {
  const ships = Object.values(ShipBundles)
  for (let i = 0; i < ships.length; i++) {
    if (ships[i].type === type) return ships[i]
  }
  warn(`unknow ship type ${type}`)
  return ShipBundles.Retro
}

import type { Vec2d } from "./types"

export function add(to: Vec2d, from: Vec2d): Vec2d {
  to.x += from.x
  to.y += from.y
  return to
}

export function rndf(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function rndi(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function wrap(vector: Vec2d, screen: Vec2d) {
  if (vector.x < 0) {
    vector.x = screen.x
  }
  if (vector.x > screen.x) {
    vector.x = 0
  }
  if (vector.y < 0) {
    vector.y = screen.y
  }
  if (vector.y > screen.y) {
    vector.y = 0
  }
}

export function round2dec(num: number, dec: number = 2): number {
  const exp = Math.pow(10, dec)
  return Math.round((num + Number.EPSILON) * exp) / exp
}


export function scalarMultiply(v: Vec2d, s: number): Vec2d {
  v.x *= s
  v.y *= s
  return v
}

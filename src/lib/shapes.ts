import type { Vec2 } from 'mathil'
import { angle2, degToRad, direction2, dist2, norm, smul2, sub2, newVec2 } from 'mathil'
import { renderPoint } from './render/render2d'

export interface ViewSlice {
  distance: number
  color: string
}

export class LightSource {
  position: Vec2
  direction: Vec2
  rays: Ray[] = []
  fovDegrees: number
  rayAngleDiff: number

  constructor(_position: Vec2, _direction: Vec2, _fovDegrees = 45, _rayAngleDiff = 2) {
    this.position = _position
    this.direction = _direction
    this.fovDegrees = _fovDegrees
    this.rayAngleDiff = _rayAngleDiff
  }

  shine(segments: LineSegment[], ctx: CanvasRenderingContext2D): ViewSlice[] {
    const slices: ViewSlice[] = []
    this.rays = []
    // min diff from 0 and 180 that wont cause issues with vertical lines:
    // const startAngle = Number.EPSILON * 14680 // = ~3.259e-12
    const startAngle = 0.000001 + angle2(this.direction) - this.fovDegrees / 2
    const stopAngle = angle2(this.direction) + this.fovDegrees / 2
    for (let a = startAngle; a <= stopAngle; a += this.rayAngleDiff) {
      this.rays.push(new Ray(this.position, direction2(a)))
    }
    for (const ray of this.rays) {
      let min = Infinity
      let nearestIntersect: Vec2 | null = null
      let color = '#000'
      for (const segment of segments) {
        const p = ray.cast(segment)
        if (p) {
          const distance = dist2(this.position, p)
          const angleRayDirection = angle2(ray.direction) - angle2(this.direction)
          const projection = distance * Math.cos(degToRad(angleRayDirection))
          if (projection < min) {
            min = projection
            nearestIntersect = p
            color = segment.color
          }
        }
      }
      if (nearestIntersect) {
        new LineSegment(this.position, nearestIntersect, '#50503a').render(ctx)
        renderPoint(ctx, nearestIntersect, '#ff0', 20)
        slices.push({ distance: min, color: color })
      }
    }
    return slices
  }

  // render(ctx: CanvasRenderingContext2D): void {
  //   for (const ray of this.rays) {
  //     ray.render(ctx)
  //   }
  //   renderPoint(ctx, this.position, '#50503a', 8)
  //   // renderVector(this.direction, this.position, ctx, 100, '#0f0')
  // }
}

export class Ray {
  position: Vec2
  direction: Vec2

  constructor(_position: Vec2, _direction: Vec2) {
    this.position = _position
    this.direction = _direction
  }

  lookAt(p: Vec2): void {
    this.direction = sub2(p, this.position)
    this.direction = norm(this.direction)
  }

  cast(ls: LineSegment): Vec2 | undefined {
    const x1 = ls.p0.x
    const y1 = ls.p0.y
    const x2 = ls.p1.x
    const y2 = ls.p1.y

    const x3 = this.position.x
    const y3 = this.position.y
    const x4 = this.position.x + this.direction.x
    const y4 = this.position.y + this.direction.y

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (denominator === 0) {
      return
    }

    const numerator_t = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)
    const numerator_u = (x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)
    const t = numerator_t / denominator
    const u = -(numerator_u / denominator)

    if (t > 0 && t < 1 && u > 0) {
      const intersect = newVec2()
      intersect.x = x1 + t * (x2 - x1)
      intersect.y = y1 + t * (y2 - y1)
      return intersect
    } else {
      return
    }
  }

  render(ctx: CanvasRenderingContext2D, scale = 1): void {
    const dirScaled = smul2(this.direction, scale)
    ctx.save()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#555'
    ctx.translate(this.position.x, this.position.y)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(dirScaled.x, dirScaled.y)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}

export class LineSegment {
  p0: Vec2
  p1: Vec2
  color: string

  constructor(_p0: Vec2, _p1: Vec2, _color = '#fff') {
    this.p0 = _p0
    this.p1 = _p1
    this.color = _color
  }

  // intersects(line: LineSegment): LineSegment | undefind {
  // }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.lineWidth = 18
    ctx.strokeStyle = this.color
    ctx.translate(0, 0)
    ctx.beginPath()
    ctx.moveTo(this.p0.x, this.p0.y)
    ctx.lineTo(this.p1.x, this.p1.y)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}

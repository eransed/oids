import type { Vec2d } from "./types";
import { direction, dist, norm, smul, sub, vec2d } from "./math";
import { renderPoint } from "./render";

export class LightSource {
  position: Vec2d
  direction: Vec2d
  rays: Ray[] = []
  fovDegrees: number

  constructor(_position: Vec2d, _direction: Vec2d, _fovDegrees: number) {
    this.position = _position
    this.direction = _direction
    this.fovDegrees = _fovDegrees
  }

  shine(segments: LineSegment[], ctx: CanvasRenderingContext2D) {
    this.rays = []
    // min diff from 0 and 180 that wont cause issues with vertical lines:
    // const startAngle = Number.EPSILON * 14680 // = ~3.259e-12
    const startAngle = 0.000001
    for (let a = startAngle; a <= 360; a += 1) {
      this.rays.push(new Ray(this.position, direction(a)))
    }
    for (const ray of this.rays) {
      let min = Infinity;
      let nearestIntersect: Vec2d | null = null
      for (const segment of segments) {
        const p = ray.cast(segment);
        if (p) {
          const d = dist(this.position, p)
          if (d < min) {
            min = d;
            nearestIntersect = p;
          }
        }
      }
      if (nearestIntersect) {
        // renderPoint(ctx, nearestIntersect, '#f00', 10)
        new LineSegment(this.position, nearestIntersect, '#50503a').render(ctx)
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const ray of this.rays) {
      ray.render(ctx)
    }
    renderPoint(ctx, this.position, '#777', 6)
  }

}

export class Ray {
  position: Vec2d
  direction: Vec2d

  constructor (_position: Vec2d, _direction: Vec2d) {
    this.position = _position
    this.direction = _direction
  }

  lookAt(p: Vec2d): void {
    this.direction = sub(p, this.position)
    this.direction = norm(this.direction)
  }

  cast(ls: LineSegment): Vec2d | undefined {
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
      const intersect = vec2d()
      intersect.x = x1 + t * (x2 - x1)
      intersect.y = y1 + t * (y2 - y1)
      return intersect
    } else {
      return
    }
  }

  render(ctx: CanvasRenderingContext2D, scale = 1): void {
    const dirScaled = smul(this.direction, scale)
    ctx.save()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#555'
    ctx.translate(this.position.x, this.position.y)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(dirScaled.x, dirScaled.y)
    ctx.stroke()
    ctx.restore()
  }

}

export class LineSegment {
  p0: Vec2d
  p1: Vec2d
  color: string

  constructor (_p0: Vec2d, _p1: Vec2d, _color = '#fff') {
    this.p0 = _p0
    this.p1 = _p1
    this.color = _color
  }

  // intersects(line: LineSegment): LineSegment | undefind {
  // }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.lineWidth = 6
    ctx.strokeStyle = this.color
    ctx.translate(0, 0)
    ctx.beginPath()
    ctx.moveTo(this.p0.x, this.p0.y)
    ctx.lineTo(this.p1.x, this.p1.y)
    ctx.stroke()
    ctx.restore()
  }

}

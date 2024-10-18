import { getScreenRect, type Vec2 } from 'mathil'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { getContext, setCanvasSizeToClientViewFrame } from '../../canvas_util'

describe('canvas_util tests', () => {
  //   const canvas = document.createElement('canvas')

  let canvas: HTMLCanvasElement
  let context: CanvasRenderingContext2D | null

  beforeEach(() => {
    // Create a mock canvas
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas) // Append to body to simulate a DOM environment
    context = getContext(canvas)
  })

  afterEach(() => {
    // Clean up after each test
    document.body.removeChild(canvas)
  })

  it('canvas exists', () => {
    expect(canvas).toBeDefined()
  })

  it('getContext returns ctx', () => {
    const result = getContext(canvas)
    expectTypeOf(result).toMatchTypeOf<CanvasRenderingContext2D | null>()
  })

  it('getScreenRect returns Vec2', () => {
    if (typeof canvas !== null) {
      if (context) {
        const result = getScreenRect(context)

        expectTypeOf(result).toMatchTypeOf<Vec2 | null>()
      }
    }
  })

  it('setCanvasSizeToClientViewFrame', () => {
    if (context) {
      const width = context.canvas.width
      const height = context.canvas.height
      setCanvasSizeToClientViewFrame(context)

      expect(context.canvas.width).toBeGreaterThan(width)
      expect(context.canvas.width).toBeGreaterThan(height)
    }
  })
})

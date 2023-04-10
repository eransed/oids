import type { Physical, Colorable, Rotatable } from "../interface";

export interface Shape extends Physical, Colorable, Rotatable {
  render(ctx: CanvasRenderingContext2D, scale?: number): void
}

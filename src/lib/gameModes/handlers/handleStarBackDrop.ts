import { add2, sub2, rndfVec2, magnitude2, smul2 } from 'mathil'
import { getScreenFromCanvas } from '../../canvas_util'
import type { Game } from '../../game'
import { offScreen_mm, wrap_mm } from '../../physics/physics'
import { renderPoint, renderLine } from '../../render/render2d'

export function handleStarBackdrop(game: Game): void {
  // move star ref with inverted view frame position and factor
  for (let i = 0; i < game.stars.length; i++) {
    const star = game.stars[i]

    if (offScreen_mm(star.position, game.localPlayer.cameraPosition, add2(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)))) {
      // just wrapping the stars looks better:
      // but this causes the stars to bunch up in a line or grid pattern after flying around some
      // so add some randomness when wrapping and regenerate them outside of the screen...
      const minRand = 0
      const maxRand = 500
      wrap_mm(star.position, sub2(game.localPlayer.cameraPosition, rndfVec2(minRand, maxRand)), add2(add2(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)), rndfVec2(minRand, maxRand)))
    }

    const starpos = sub2(star.position, game.localPlayer.cameraPosition)
    renderPoint(game.ctx, starpos, game.style.starColor, star.size)

    //Warp effect
    if (magnitude2(game.localPlayer.velocity) > 0) {
      renderLine(
        game.ctx,
        {
          p1: starpos,
          p2: smul2(game.localPlayer.viewFramePosition, 1),
        },
        game.style.starColor,
        0.0025 * magnitude2(game.localPlayer.velocity),
      )
    }
  }
}

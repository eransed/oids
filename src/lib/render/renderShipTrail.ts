import type { SpaceObject } from '../interface'
import type { UIStyle } from '../interface'

import { add2, direction2, mul2, newVec2, rndi, round2dec, sdiv2, smul2, sub2, type Vec2 } from 'mathil'
import { screenScale } from '../constants'
// import * as ship from '../../assets/ship.svg'
import { renderShot, renderVector, setScaledFont } from './render2d'
import { getShipBundleCache, ShipVariant } from '../../style/ships'
import { getWorldCoordinates } from '../physics/physics'
import { randomAnyColor, randomAnyLightColor, randomColor, randomRed } from '../color'

export function renderTrail(
  so: SpaceObject,
  ctx: CanvasRenderingContext2D,
  renderAsLocalPlayer = false,
  style: UIStyle,
  renderPos: Vec2 | null = null,
  showVectors = false
): void {


    ctx.save()

    if (!renderPos) {
    ctx.translate(so.viewFramePosition.x, so.viewFramePosition.y)
    // shipTranslation = so.viewFramePosition
    } else {
    ctx.translate(renderPos.x, renderPos.y)
    // shipTranslation = renderPos
    }

    ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)


    for (let i = 0; i < 100; i++) {
        // ctx.fillStyle = randomColor('bcdef', '789abc', 'de')
        ctx.fillStyle = randomColor('def', 'ab', '0')
        ctx.fillRect(45+rndi(-5, 5), 85 + rndi(0, 50), rndi(10, 15), rndi(5, 10))
        ctx.fillRect(-60+rndi(-5, 5), 85 + rndi(0, 50), rndi(10, 15), rndi(5, 10))
    }


    ctx.restore()

    //   if (renderPos) {
    //       renderVector(
    //           smul2(direction2(so.angleDegree), 10),
    //           renderPos,
    //           ctx,
    //           50,
    //           '#fff'
    //         )
    //     }

}



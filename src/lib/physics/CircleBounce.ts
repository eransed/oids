import * as mathil from 'mathil'
import type { Physical } from '../interface';

export function circleBounce(so0: Physical, so1: Physical, bounceFactor = 10, so1Bounce=true) {

    // https://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
    let collision = mathil.sub2(so0.position, so1.position)

    bounceFactor = mathil.dist2(so0.velocity) * mathil.dist2(so1.velocity) * bounceFactor

    collision = mathil.smul2(collision, bounceFactor)

    const distance = mathil.dist2(collision)

    if (distance < 1) {
        return
    }

    collision = mathil.sdiv2(collision, distance);
    const aci = mathil.dotProduct(so0.velocity, collision)
    const bci = mathil.dotProduct(so1.velocity, collision)

    const acf = bci;
    const bcf = aci;

    so0.velocity = mathil.add2(so0.velocity, (mathil.smul2(collision, (acf - aci))))
    if (so1Bounce) {
        so1.velocity = mathil.add2(so1.velocity, (mathil.smul2(collision, (bcf - bci))))
    }

}

import { setCanvasSize, getScreenCenterPosition, getScreenRect } from '../canvas_util'
import { randomAnyLightColor, randomBlue } from '../color'
import { createSpaceObject } from '../factory'
import type { Game } from '../game'
import { add, rndfVec2d, rndi } from '../math'
import { wrapSpaceObject } from '../mechanics'
import { gravity } from '../physics'
import { loadingText, renderComet, renderMoon } from '../render'
import { GameType, SpaceShape } from '../types'


export function nextFrame(game: Game, dt: number): void {

  game.bodies.forEach((body) => {
    game.bodies.forEach((other) => {
      if (body !== other) {
        gravity(body, other)
      }
    })

    wrapSpaceObject(body, getScreenRect(game.ctx))
  })
}

export function renderFrame(game: Game, dt: number): void {
  setCanvasSize(game.ctx)
  game.ctx.save()
  game.ctx.fillStyle = '#000'
  game.ctx.fill()
  game.ctx.beginPath()
  game.ctx.strokeStyle = '#f00'
  game.ctx.lineWidth = 10
  game.ctx.stroke()
  game.ctx.fill()
  game.ctx.restore()

  game.bodies.forEach((body) => {
    if (body.shape === SpaceShape.Moon) {
      renderMoon(body, game.ctx)
    }

    if (body.shape === SpaceShape.Comet) {
      renderComet(body, game.ctx)
    }
  })
}


export function initWelcomeScreen (game: Game): void {
  if (game.isRunning()) {
    console.log('Game is already running')
    return
  }

  game.running = true
  console.log('starts welcomescreen')
  game.type = GameType.WelcomeScreen

  loadingText('Loading...', game.ctx)

  const offset = 2000

  let speedMin = -0.5
  let speedMax = 0

  //Moons
  for (let n = 0; n < 10; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Moon
    s.color = randomBlue()
    s.mass = 1
    s.isLocal = true
    s.size.y = rndi(10, 70)
    s.acceleration.x = rndi(speedMin, speedMax)
    s.acceleration.y = rndi(speedMin, speedMax)
    s.health = 0
    s.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
    game.bodies.push(s)
  }

  //Comets
  for (let n = 0; n < 10; n++) {
    const s = createSpaceObject()
    s.shape = SpaceShape.Comet
    s.color = randomAnyLightColor()
    s.mass = 2
    s.isLocal = true
    s.acceleration.x = rndi(speedMin, speedMax)
    s.acceleration.y = rndi(speedMin, speedMax)
    s.size.x = rndi(50, 80)
    s.size.y = rndi(50, 80)
    s.health = 0
    s.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))
    game.bodies.push(s)
  }

  game.all = game.all.concat(game.bodies)

}

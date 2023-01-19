import { GameType, SpaceShape, type SpaceObject } from './types'

import { initKeyControllers, spaceObjectKeyController } from './input'
import { bounceSpaceObject } from './mechanics'
import { loadingText, renderMoon, renderOGShip, renderShip, renderSpaceObjectStatusBar } from './render'
import { getContext, getScreenCenterPosition, getScreenRect, setCanvasSize } from './canvas_util'
import { friction, gravity, handleCollisions } from './physics'
import { add, direction, linearTransform, rndfVec2d, rndi, sub } from './math'
import { randomAnyColor } from './color'
import { fpsCounter, renderLoop } from './time'
import { test } from './test'
import { getSerVer, initMultiplayer, registerServerUpdate } from './multiplayer'
import { LightSource, LineSegment } from './shapes'

export class Game {
  type: GameType = GameType.SinglePlayer
  ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  localPlayer: SpaceObject
  private remotePlayers: SpaceObject[] = []
  lightSource = new LightSource({ x: 1000, y: 750 }, { x: 1, y: 0 }, 45, 1)
  segments: LineSegment[] = []
  running = false

  constructor(_canvas: HTMLCanvasElement, _localPlayer: SpaceObject) {
    this.canvas = _canvas
    this.localPlayer = _localPlayer
    this.ctx = getContext(this.canvas)
  }

  isRunning(): boolean {
    return this.running
  }

  shouldQuit(): boolean {
    return !this.running
  }

  stopGame(): void {
    console.log ('Stops game')
    this.running = false
  }

  startSingleplayer(): void {
    console.log('starts single')
  }

  startMultiplayer(): void {

    if (this.isRunning()) {
      console.log('Game is already running')
      return
    }

    this.running = true
    console.log('starts multi')
    this.type = GameType.MultiPlayer
    if (!test()) {
      return
    }

    //Needs to be a default canvas size so people get the same game size.
    setCanvasSize(this.ctx)
    loadingText('Loading...', this.ctx)
    initKeyControllers()

    const offset = 500

    // const this.localPlayer: SpaceObject = createSpaceObject()
    this.localPlayer.position = add(getScreenCenterPosition(this.ctx), rndfVec2d(-offset, offset))
    this.localPlayer.mass = 0.1
    this.localPlayer.angleDegree = -120
    this.localPlayer.health = 250
    this.localPlayer.steeringPower = 0.55
    this.localPlayer.enginePower = 0.025
    this.localPlayer.name = `P-${rndi(0, 900000)}`
    this.localPlayer.color = randomAnyColor()
    this.localPlayer.photonColor = '#f0f'
    this.localPlayer.isLocal = true
    console.log('Your ship name is: ' + this.localPlayer.name + '\nAnd your color is: ' + this.localPlayer.color)

    // if (getMenu(this.localPlayer.WelcomeMenu) === 'Startup') {
    //   console.log('Render Welcome Menu')
    //   this.localPlayer.WelcomeMenu = false
    //   //Can't import Svelte components to Typescript so I cant render it :(
    // }

    //if chosen multiplayer
    initMultiplayer()

    //if chosen singleplayer
    // ship.ExistingGame = true
    // ship.GameTypes.SinglePlayer = true

    const padding = 0
    const pad = { x: padding, y: padding }
    const scr = sub(getScreenRect(this.ctx), pad)
    this.segments.push(new LineSegment(pad, { x: scr.x, y: padding }, '#f00'))
    this.segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, '#00f'))
    this.segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, '#0f0'))
    this.segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

    // const padding2 = 650
    // const pad2 = {x: padding2, y: padding2}
    // const scr2 = sub(getScreenRect(ctx), pad2)
    // segments.push(new LineSegment(pad2, {x: scr2.x, y: padding2}))
    // segments.push(new LineSegment({x: scr2.x, y: padding2}, {x: scr2.x, y: scr2.y}))
    // segments.push(new LineSegment({x: scr2.x, y: scr2.y}, {x: padding2, y: scr2.y}))
    // segments.push(new LineSegment({x: padding2, y: scr2.y}, {x: padding2, y: padding2}))

    // segments.push(new LineSegment({x: 2000, y:200}, {x: 2000, y: 1000}))
    // segments.push(new LineSegment({x: 2400, y:300}, {x: 2300, y: 1600}))
    // segments.push(new LineSegment({x: 700, y:600}, {x: 1000, y: 1500}))
    // segments.push(new LineSegment({x: 200, y:700}, {x: 1400, y: 1000}))

    // document.addEventListener('mousemove', (event) => {
    // lightSource.position = getMousePosition(canvas, event)
    // const l = linearTransform(getMousePosition(canvas, event).y, 0, getScreenRect(ctx).y, 0, 100)
    // const hsl = new HSL(shade)
    // hsl.l = l
    // background = hsl.toHex()
    // console.log(background)
    // })

    const bodies: SpaceObject[] = []

    // for (let n = 0; n < 2; n++) {
    //   const s = createSpaceObject()
    //   s.shape = SpaceShape.Moon
    //   s.color = randomBlue()
    //   s.mass = 5
    //   s.isLocal = true
    //   s.position = add(getScreenCenterPosition(ctx), rndfVec2d(-offset, offset))
    //   bodies.push(s)
    // }

    let all: SpaceObject[] = []
    all = all.concat(bodies)
    all.push(this.localPlayer)

    let serverObjects: SpaceObject[] = []

    registerServerUpdate((so: SpaceObject) => {
      for (let i = 0; i < serverObjects.length; i++) {
        if (so.name === serverObjects[i].name) {
          if (!so.online) {
            console.log(`${so.name} went offline`)
          }
          serverObjects[i] = so
          return
        }
      }
      if (so.name !== this.localPlayer.name) {
        serverObjects.push(so)
        console.log(`New ship online: ${so.name}`)
      }
    })

    const renderFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
      this.lightSource.position = this.localPlayer.position
      this.lightSource.direction = direction(this.localPlayer.angleDegree)

      const viewSlices = this.lightSource.shine(this.segments, ctx)
      const viewTopLeft = { x: 2500, y: 100 }
      const viewSize = { x: 25 * viewSlices.length, y: 15 * viewSlices.length }
      const viewSlizeWidth = Math.floor(viewSize.x / viewSlices.length)
      ctx.save()

      ctx.fillStyle = '#000'
      ctx.fillRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
      ctx.fill()

      ctx.beginPath()
      for (let i = 0; i < viewSlices.length; i++) {
        const roofFloorPad = 150
        const c = linearTransform(viewSlices[i].distance, 0, getScreenRect(ctx).x + 250, 255, 2)
        const h = linearTransform(viewSlices[i].distance, 0, getScreenRect(ctx).x, viewSize.y - roofFloorPad, roofFloorPad)
        const y = viewTopLeft.y + (viewSize.y - h) / 2
        // ctx.fillStyle = greyScale(c)
        ctx.fillStyle = viewSlices[i].color
        ctx.fillRect(viewTopLeft.x + viewSlizeWidth * i, y, viewSlizeWidth, h)
      }
      ctx.strokeStyle = '#f00'
      ctx.lineWidth = 10
      ctx.strokeRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
      ctx.stroke()
      ctx.fill()
      ctx.restore()

      for (const segs of this.segments) {
        segs.render(ctx)
      }

      serverObjects.forEach((so) => {
        if (so.shape === SpaceShape.Moon) {
          renderMoon(so, ctx)
        } else {
          renderShip(so, ctx)
        }
      })

      renderSpaceObjectStatusBar(serverObjects, this.localPlayer, ctx)
      // renderVector(ship.acceleration, ship.position, ctx, 400)
      // renderVector(ship.velocity, ship.position, ctx, 10)
      bodies.forEach((body) => {
        renderMoon(body, ctx)
      })

      fpsCounter(dt, getSerVer(), ctx)
      renderOGShip(this.localPlayer, ctx, true)
    }

    const nextFrame = (ctx: CanvasRenderingContext2D, dt: number): void => {
      spaceObjectKeyController(this.localPlayer, dt)
      friction(this.localPlayer)
      // wrapSpaceObject(ship, getScreenRect(ctx))
      bounceSpaceObject(this.localPlayer, getScreenRect(ctx), 0.4, 0, 0)

      bodies.forEach((body) => {
        bodies.forEach((other) => {
          if (body !== other) {
            gravity(body, other)
          }
        })

        gravity(body, this.localPlayer)

        this.localPlayer.shotsInFlight.forEach((shot) => {
          gravity(body, shot)
        })

        friction(body)
        // wrapSpaceObject(body, getScreenRect(ctx))
        bounceSpaceObject(body, getScreenRect(ctx), 0.4, 0, 0)
      })

      serverObjects = serverObjects.filter((so) => {
        return so.online || so.isLocal
      })

      const currentSpaceObjects = all.concat(serverObjects)

      handleCollisions(currentSpaceObjects, ctx)
    }
    renderLoop(this, renderFrame, nextFrame, bodies)
  }
}

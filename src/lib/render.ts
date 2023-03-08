import { SpaceShape, type Damageable, type SpaceObject, type Vec2d } from "./types"
import { add, degToRad, linearTransform, magnitude, rndi, round2dec, scalarMultiply, to_string } from "./math"
import { explosionDuration, screenScale, timeScale } from "./constants"
import { getScreenFromCanvas, getScreenRect } from "./canvas_util"
import { getConnInfo, getReadyStateText } from "./webSocket"
import { LineSegment } from "./shapes"
import type { Game } from "./game"
import { delayFrames } from "./time"

export function clearScreen(ctx: CanvasRenderingContext2D, color = "#000") {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function render(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  switch (s.shape) {
    case SpaceShape.Moon:
      renderMoon(s, ctx)
      break
    case SpaceShape.SmallShip:
      renderShip(s, ctx)
      break
    default:
      console.error(`Unknown shape: ${s.shape}`)
  }
}

export function renderFrameInfo(fps: number, frameTimeMs: number, ver: string, ctx: CanvasRenderingContext2D): void {
  const xpos = 26
  const xposBar = 20
  const dec = 1
  const screen: Vec2d = getScreenRect(ctx)
  const ratio: number = round2dec(screen.x / screen.y, 2)
  setScaledFont(ctx)
  ctx.fillStyle = "#fff"
  ctx.fillText("FPS: " + round2dec(fps, dec), xpos, 50)
  ctx.fillText("DT:  " + round2dec(frameTimeMs, dec) + "ms", xpos, 100)
  ctx.fillText("DTS: " + round2dec(frameTimeMs * timeScale, dec), xpos, 150)
  ctx.fillText("RES: " + screen.x + "x" + screen.y + " (x" + screenScale + ", " + ratio + ")", xpos, 200)
  ctx.fillText(`WS: ${getReadyStateText()} ${getConnInfo()}`, xpos, 250)
  renderProgressBar({ x: xposBar, y: 270 }, "Load", frameTimeMs, 50, ctx, -40)
  ctx.fillStyle = "#444"
  ctx.fillText("" + ver, screen.x - ver.length * 27, 50)
}

export function loadingText(text: string, ctx: CanvasRenderingContext2D) {
  ctx.font = "bold 80px courier"
  ctx.fillStyle = "#fff"
  const ppt = 15
  ctx.fillText(text, getScreenRect(ctx).x / 2 - text.length * ppt, getScreenRect(ctx).y / 2)
}

export function getNamesAsString(sos: SpaceObject[], label = ""): string {
  const arr: string[] = []
  sos.forEach((e) => {
    arr.push(`(${e.name}, ${e.health}hp)`)
  })
  return label + arr.join(", ")
}

const renderSpeedometer = (screen: Vec2d, so: SpaceObject, ctx: CanvasRenderingContext2D) => {
  renderRoundIndicator({ x: screen.x - 400, y: screen.y - 370 }, 100 * Math.abs(so.velocity.y), 0, 2000, ctx, 150, "y m/s")
  renderRoundIndicator({ x: screen.x - 1100, y: screen.y - 370 }, 100 * Math.abs(so.velocity.x), 0, 2000, ctx, 150, "x m/s")
}

export function renderSpaceObjectStatusBar(serverObjects: SpaceObject[], so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  const screen: Vec2d = getScreenFromCanvas(ctx)
  const yrow1: number = screen.y - 30
  const ydiff = 60
  const yrow2: number = screen.y - ydiff - 30
  const yrow3: number = yrow2 - ydiff
  const yrow4: number = yrow3 - ydiff
  const xpos = 26
  const xposBar = 20
  const scale = setScaledFont(ctx)

  ctx.save()

  //Speedometer
  // renderSpeedometer(screen, so, ctx)

  ctx.fillStyle = "#fff"
  ctx.fillText(`Local: ${so.name}`, xpos, yrow1)
  // ctx.fillText(`---------------------`, xpos, yrow3)
  ctx.fillText(getNamesAsString(serverObjects, `Online (${serverObjects.length}): `), xpos, yrow2)
  ctx.fillText("SIF: " + so.shotsInFlight.length, xpos + 360, yrow1)
  // ctx.fillText(so.health + 'hp', xpos + offset * 0.5, yrow1)
  // ctx.fillText('Ammo: ' + so.ammo, xpos + offset * 0.9, yrow1)
  // ctx.fillText(round2dec(magnitude(so.velocity), 1) + ' pix/fra', xpos + offset * 1.5, ypos)
  ctx.fillText("P" + to_string(so.position, 0), xpos + 600, yrow1)
  ctx.fillText("V" + to_string(so.velocity, 1), xpos + 1000, yrow1)
  ctx.fillText("A" + to_string(scalarMultiply(so.acceleration, 1000), 1), xpos + 1400, yrow1)
  const firstBar = 170
  const barDiff = 80
  renderProgressBar({ x: xposBar, y: yrow1 - firstBar }, "hp", so.health, 250, ctx, 75)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 1) }, "Bat", so.batteryLevel, 500, ctx, 250)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 2) }, "Amm", so.ammo, 1000, ctx, 200)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 3) }, "Speed", magnitude(so.velocity), 20, ctx, -15)
  const cstate: string = so.canonOverHeat ? "Overheat" : "Heat"
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 4) }, cstate, so.canonCoolDown, 100, ctx, -50, so.canonOverHeat, "#d44")
  // renderProgressBar({ x: xpos, y: yrow1 - 500 }, 'SIF', so.shotsInFlight.length, 4000, ctx, -2800)
  // renderProgressBar({ x: xpos, y: yrow1 - 700 }, 'Acc.', magnitude(so.acceleration), 0.1, ctx, -0.05)
  ctx.restore()
}

export function renderVector(v: Vec2d, origin: Vec2d, ctx: CanvasRenderingContext2D, scale = 10000, color = "#fff", offset: Vec2d = { x: 0, y: 0 }) {
  ctx.save()
  ctx.translate(origin.x + offset.x, origin.y + offset.y)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 5
  ctx.moveTo(0, 0)
  ctx.lineTo(scale * v.x, scale * v.y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function renderPoint(ctx: CanvasRenderingContext2D, v: Vec2d, color: string, radius = 10): void {
  ctx.save()
  ctx.translate(v.x, v.y)
  ctx.fillStyle = color
  ctx.lineWidth = 4
  ctx.beginPath()
  // ctx.strokeStyle = color
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function renderHitBox(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
  ctx.strokeStyle = "#fff"
  ctx.strokeRect(0, 0, so.size.x, so.size.y)
  ctx.restore()
}

export function renderHitRadius(so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.strokeStyle = "#447"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, so.hitRadius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function renderShip(so: SpaceObject, ctx: CanvasRenderingContext2D, renderAsLocalPlayer = false): void {
  const scale = setScaledFont(ctx)
  const shipSize: Vec2d = { x: 60, y: 100 }
  so.size = shipSize

  // Render hit box of ship after contex restore
  //renderHitRadius(so, ctx)

  ctx.save()
  ctx.translate(so.position.x, so.position.y)
  ctx.rotate((round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
  ctx.lineWidth = 2 * screenScale

  // Hull
  ctx.strokeStyle = so.colliding ? "#f00" : so.color
  ctx.fillStyle = so.colliding ? "#f00" : so.color
  ctx.beginPath()
  ctx.moveTo(0, (-shipSize.y / 3) * scale)
  ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
  ctx.lineTo(0, (-shipSize.y / 3) * scale)
  ctx.closePath()

  if (renderAsLocalPlayer) {
    ctx.stroke()
  } else {
    ctx.fill()
  }

  ctx.fillStyle = "#f00"
  ctx.rotate((20 * Math.PI) / 180)
  if (!so.online && !renderAsLocalPlayer) {
    ctx.fillText(so.name, (-1.2 * so.size.x) / 2, -30)
    ctx.fillText("offline", (-1.2 * so.size.x) / 2, 30)
  }

  // Restore drawing
  ctx.restore()

  // Draw shots
  renderShot(so, ctx)
}

export function renderHitExplosion(pos: Vec2d, ctx: CanvasRenderingContext2D) {
  const offset = 20
  const minSize = 1
  const maxSize = 30
  ctx.save()
  ctx.translate(pos.x, pos.y)
  for (const c of ["#ff0", "#f00", "#ee0", "#e00", "#dd0", "#d00", "#008", "#000", "#444", "#fee", "#f66,", "#f99", "#fbb"]) {
    const center = add({ x: 0, y: 0 }, { x: rndi(-offset, offset), y: rndi(-offset, offset) })
    const size = add({ x: 0, y: 0 }, { x: rndi(minSize, maxSize), y: rndi(minSize, maxSize) })
    ctx.fillStyle = c
    ctx.fillRect(center.x, center.y, size.x, size.y)
  }
  ctx.restore()
}

export function renderExplosionFrame(so: SpaceObject, ctx: CanvasRenderingContext2D) {
  //delayFrames(5000)
  const offset = 50
  const minSize = 1
  const maxSize = 30 * so.deadFrameCount * 0.03
  ctx.save()
  ctx.translate(so.position.x - so.size.x / 2, so.position.y - so.size.y / 2)
  const colors = ["#ff0", "#f00", "#ee0", "#e00", "#dd0", "#d00", "#008", "#000", "#444", "#fee", "#f66,", "#f99", "#fbb"]

  if (so.deadFrameCount < explosionDuration * 1) {
    for (const c of colors) {
      const center = add({ x: 0, y: 0 }, { x: rndi(-offset, offset), y: rndi(-offset, offset) })
      const size = add({ x: 0, y: 0 }, { x: rndi(minSize, maxSize), y: rndi(minSize, maxSize) })
      ctx.fillStyle = c
      ctx.fillRect(center.x, center.y, size.x, size.y)
    }
  }
  for (let i = 2; i < 3; i += 0.7) {
    ctx.beginPath()

    ctx.arc(0, 0, so.deadFrameCount * i * i * i, 0, degToRad(360))

    ctx.closePath()
    ctx.strokeStyle = "#fff"
    // ctx.lineWidth = (100 / Math.sqrt(so.deadFrameCount ?? 1)) * 2
    ctx.lineWidth = (explosionDuration - so.deadFrameCount) / i
    // ctx.lineWidth = so.deadFrameCount + 10
    ctx.stroke()
  }

  ctx.restore()
}

export function renderShot(so: SpaceObject, ctx: CanvasRenderingContext2D) {
  ctx.save()
  for (const shot of so.shotsInFlight) {
    if (shot.didHit) continue
    if (Math.random() > 0.99) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#fff" : "#fff"
    } else if (Math.random() > 0.9) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#f0f" : "#fff"
    } else if (Math.random() > 0.8) {
      ctx.fillStyle = shot.armedDelay < 0 ? "#0f0" : "#fff"
    } else {
      ctx.fillStyle = shot.armedDelay < 0 ? shot.color : "#fff"
    }
    ctx.save()
    ctx.translate(shot.position.x, shot.position.y)
    ctx.rotate(((90 + shot.angleDegree) * Math.PI) / 180)
    ctx.fillRect(-shot.size.x / 2, -shot.size.y / 2, shot.size.x, shot.size.y)
    ctx.restore()
  }
  ctx.restore()
}

export function renderMoon(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(s.position.x, s.position.y)
  ctx.beginPath()
  ctx.fillStyle = s.color
  ctx.arc(0, 0, s.size.y, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()
  setScaledFont(ctx)
  ctx.fillStyle = "#ccc"
  //ctx.fillText(`${s.health}hp`, 0, 0)
  ctx.restore()
}

export function renderComet(s: SpaceObject, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(s.position.x, s.position.y)
  ctx.beginPath()
  ctx.fillStyle = s.color
  ctx.ellipse(0, 0, s.size.x, s.size.y, 0, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
  setScaledFont(ctx)
  ctx.fillStyle = "#ccc"
  //ctx.fillText(`${s.health}hp`, 0, 0)
  ctx.restore()
}

export function setScaledFont(ctx: CanvasRenderingContext2D): number {
  const scale = screenScale - 1 > 1 ? screenScale - 1 : 1
  ctx.font = `bold ${16 * scale}px courier`
  return scale
}

export function renderProgressBar(
  pos: Vec2d,
  label: string,
  amount: number,
  max: number,
  ctx: CanvasRenderingContext2D,
  redLevel = 60,
  warn = false,
  textWarnColor = "#7b7b7b"
): void {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  const linew = 8
  const w = 500
  const h = 50

  ctx.lineWidth = linew
  ctx.strokeStyle = "#fff"
  ctx.fillStyle = "#fff"

  if (amount < redLevel || (redLevel < 0 && amount > Math.abs(redLevel))) {
    // ctx.fillStyle = '#ffa500'
    ctx.fillStyle = "#ff0"
  } else if (redLevel < 0 && amount < Math.abs(redLevel)) {
    // ctx.fillStyle = '#090'
  }
  const percent_n: number = (100 * amount) / max
  const percent = `${round2dec(percent_n, 0)}%`
  // const percent = `${round2dec(percent_n, 0)}% (${round2dec(amount, 0)}/${max})`

  if (amount < 0) {
    amount = 0
  }

  let p: number = (w * amount) / max - linew
  if (p < 0) p = 0
  if (p > w) {
    ctx.fillStyle = "#600"
    p = w - linew
  }

  ctx.fillRect(Math.floor(linew / 2), Math.floor(linew / 2), p, h - Math.floor(linew / 2))

  ctx.lineWidth = 1
  ctx.strokeRect(w - Math.floor(linew / 2), Math.floor(linew / 2) + 1, 1, h - Math.floor(linew / 2) - 1)
  ctx.strokeRect(Math.floor(linew / 2), Math.floor(linew / 2) + 1, 1, h - Math.floor(linew / 2) - 1)

  setScaledFont(ctx)
  ctx.fillStyle = "#7b7b7b"
  if (percent_n > 56) {
    // ctx.fillStyle = '#000'
  }
  if (warn) {
    ctx.fillStyle = textWarnColor
  }
  ctx.fillText(percent, w / 2 - 10 * percent.length, linew + Math.floor(h / 2) + 1)
  ctx.fillText(label, linew * 2, linew + Math.floor(h / 2) + 1)

  ctx.restore()
}

export function renderNumber(num: number, pos: Vec2d, ctx: CanvasRenderingContext2D, angleAdjDeg = 0) {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(degToRad(angleAdjDeg))
  ctx.font = `bold 22px courier`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(`${num}`, 0, 0)
  ctx.restore()
}

export function renderRoundIndicator(
  centerPos: Vec2d,
  value: number,
  min: number,
  max: number,
  ctx: CanvasRenderingContext2D,
  radius = 100,
  unitLabel: string,
  steps = 20
): void {
  ctx.save()
  ctx.translate(centerPos.x, centerPos.y)
  ctx.beginPath()
  ctx.strokeStyle = "#fff"
  ctx.fillStyle = "#fff"
  ctx.lineWidth = 8

  const ang1 = -240
  const meterAngleTest = round2dec(linearTransform(value, min, max, 0, -ang1), 0)
  const meterAngleTestStr = meterAngleTest + ""
  const roundVal = `${round2dec(value, 0)}`
  ctx.fillText(`${meterAngleTest}`, -8 * meterAngleTestStr.length, radius / 2)
  // ctx.fillText(`${roundVal}`, -8 * roundVal.length , radius/2)
  ctx.fillText(`${unitLabel}`, -8 * unitLabel.length, radius / 2 + 40)

  ctx.arc(0, 0, radius / 10, 0, (360 * 180) / Math.PI)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, radius, degToRad(ang1), degToRad(60), false)
  ctx.closePath()
  ctx.stroke()

  ctx.lineWidth = 3
  ctx.rotate(degToRad(ang1))

  const outerOff = 20
  const innerOff = 60
  const numberOffset = 100

  ctx.beginPath()
  ctx.moveTo(radius - outerOff, 0)
  ctx.lineTo(radius - innerOff, 0)
  let fixAng = 260
  const rot = Math.floor(meterAngleTest / 360) * 360
  renderNumber(rot, { x: radius - numberOffset, y: 0 }, ctx, (fixAng -= steps))
  for (let i = 1; i < 16; i++) {
    ctx.rotate(degToRad(steps))
    renderNumber(i * steps + rot, { x: radius - numberOffset, y: 0 }, ctx, (fixAng -= steps))
    ctx.moveTo(radius - outerOff, 0)
    ctx.lineTo(radius - innerOff, 0)
  }

  ctx.closePath()
  ctx.stroke()

  ctx.resetTransform()

  ctx.translate(centerPos.x, centerPos.y)
  ctx.rotate(degToRad(ang1))

  const meterAngle = linearTransform(value, min, max, 0, -ang1)
  ctx.beginPath()
  const needleWith = 10
  ctx.rotate(degToRad(meterAngle)) // 0 - 270 -> min - max
  ctx.moveTo(0, 0)
  ctx.lineTo(radius - 25, 0)
  ctx.moveTo(-needleWith / 2, 0)
  ctx.lineWidth = needleWith
  ctx.strokeStyle = "#c00"
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

const render3DFrame = (game: Game) => {
  const scr = getScreenRect(game.ctx)
  const padding = 0
  const pad: Vec2d = { x: padding, y: padding }
  game.segments.push(new LineSegment(pad, { x: scr.x, y: padding }, "#f00"))
  game.segments.push(new LineSegment({ x: scr.x, y: padding }, { x: scr.x, y: scr.y }, "#00f"))
  game.segments.push(new LineSegment({ x: scr.x, y: scr.y }, { x: padding, y: scr.y }, "#0f0"))
  game.segments.push(new LineSegment({ x: padding, y: scr.y }, { x: padding, y: padding }))

  const viewSlices = game.lightSource.shine(game.segments, game.ctx)
  const viewTopLeft = { x: getScreenRect(game.ctx).x - 1200, y: 100 }
  const viewSize = { x: 25 * viewSlices.length, y: 15 * viewSlices.length }
  const viewSlizeWidth = Math.floor(viewSize.x / viewSlices.length)
  game.ctx.save()

  game.ctx.fillStyle = "#000"
  game.ctx.fillRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
  game.ctx.fill()

  game.ctx.beginPath()
  for (let i = 0; i < viewSlices.length; i++) {
    const roofFloorPad = 150
    const c = linearTransform(viewSlices[i].distance, 0, getScreenRect(game.ctx).x + 250, 255, 2)
    const h = linearTransform(viewSlices[i].distance, 0, getScreenRect(game.ctx).x, viewSize.y - roofFloorPad, roofFloorPad)
    const y = viewTopLeft.y + (viewSize.y - h) / 2
    game.ctx.fillStyle = viewSlices[i].color
    game.ctx.fillRect(viewTopLeft.x + viewSlizeWidth * i, y, viewSlizeWidth, h)
  }
  game.ctx.strokeStyle = "#f00"
  game.ctx.lineWidth = 10
  game.ctx.strokeRect(viewTopLeft.x, viewTopLeft.y, viewSize.x, viewSize.y)
  game.ctx.stroke()
  game.ctx.fill()
  game.ctx.restore()

  for (const segs of game.segments) {
    segs.render(game.ctx)
  }
}

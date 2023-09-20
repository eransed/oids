import type { Bounded, Remote, SpaceObject, UIStyle } from '../interface'
import { degToRad, linearTransform, magnitude, round2dec, scalarMultiply, to_string2, type Vec2 } from 'mathil'
import { getScreenFromCanvas, getScreenRect } from '../canvas_util'
import { getNamesAsString, setScaledFont } from './render2d'
// import { getConnInfo, getReadyStateText } from '../websocket/webSocket'
import { screenScale, timeScale } from '../constants'
import type { Game } from '../game'

//Rendering the viewport of other players
export function renderViewport(ctx: CanvasRenderingContext2D, remotePlayer: Remote & Bounded): void {
  const viewport = remotePlayer.viewport
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 5
  ctx.strokeRect(0, 0, viewport.x, viewport.y)
}

export function renderRect(ctx: CanvasRenderingContext2D, size: Vec2, pos: Vec2, color='#ccc', lineWidth=10): void {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(pos.x, pos.y, size.x, size.y)
}

export function renderSpaceObjectStatusBar(serverObjects: SpaceObject[], so: SpaceObject, ctx: CanvasRenderingContext2D): void {
  const screen: Vec2 = getScreenFromCanvas(ctx)
  const yrow1: number = screen.y - 30
  const ydiff = 60
  const yrow2: number = screen.y - ydiff - 30
  const yrow3: number = yrow2 - ydiff
  const yrow4: number = yrow3 - ydiff
  const xpos = 26
  const xposBar = 20
  const scale = setScaledFont(ctx)

  const renderSpeedometer = (screen: Vec2, so: SpaceObject, ctx: CanvasRenderingContext2D) => {
    renderRoundIndicator({ x: screen.x - 400, y: screen.y - 370 }, 100 * Math.abs(so.velocity.y), 0, 2000, ctx, 150, 'y m/s')
    renderRoundIndicator({ x: screen.x - 1100, y: screen.y - 370 }, 100 * Math.abs(so.velocity.x), 0, 2000, ctx, 150, 'x m/s')
  }

  ctx.save()

  //Speedometer
  // renderSpeedometer(screen, so, ctx)

  ctx.fillStyle = '#fff'
  ctx.fillText(`Local: ${so.name}`, xpos, yrow1)
  // ctx.fillText(`---------------------`, xpos, yrow3)
  ctx.fillText(getNamesAsString(serverObjects, `Online (${serverObjects.length}): `), xpos, yrow2)
  ctx.fillText('SIF: ' + so.shotsInFlight.length, xpos + 360, yrow1)
  // ctx.fillText(so.health + 'hp', xpos + offset * 0.5, yrow1)
  // ctx.fillText('Ammo: ' + so.ammo, xpos + offset * 0.9, yrow1)
  // ctx.fillText(round2dec(magnitude(so.velocity), 1) + ' pix/fra', xpos + offset * 1.5, ypos)
  ctx.fillText('P' + to_string2(so.position, 0), xpos + 600, yrow1)
  ctx.fillText('V' + to_string2(so.velocity, 1), xpos + 1000, yrow1)
  ctx.fillText('A' + to_string2(scalarMultiply(so.acceleration, 1000), 1), xpos + 1400, yrow1)
  const firstBar = 170
  const barDiff = 80
  renderProgressBar({ x: xposBar, y: yrow1 - firstBar }, 'hp', so.health, 250, ctx, 75)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 1) }, 'Bat', so.batteryLevel, 500, ctx, 250)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 2) }, 'Amm', so.ammo, 1000, ctx, 200)
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 3) }, 'Speed', magnitude(so.velocity), 20, ctx, -15)
  const cstate: string = so.canonOverHeat ? 'Overheat' : 'Heat'
  renderProgressBar({ x: xposBar, y: yrow1 - (firstBar + barDiff * 4) }, cstate, so.canonCoolDown, 100, ctx, -50, so.canonOverHeat, '#d44')
  // renderProgressBar({ x: xpos, y: yrow1 - 500 }, 'SIF', so.shotsInFlight.length, 4000, ctx, -2800)
  // renderProgressBar({ x: xpos, y: yrow1 - 700 }, 'Acc.', magnitude(so.acceleration), 0.1, ctx, -0.05)
  ctx.restore()
}

//Frame-info
export function renderFrameInfo(ops: number, fps: number, frameTimeMs: number, fc: number, game: Game, ctx: CanvasRenderingContext2D): void {
  const xpos = 26
  const dec = 1
  const screen: Vec2 = getScreenRect(ctx)
  const ratio: number = round2dec(screen.x / screen.y, 2)
  setScaledFont(ctx)
  ctx.fillStyle = '#fff'
  const info = `WS: ${game.websocket.getStateString()} ${game.websocket.getStatusString()}   RES: ${screen.x}x${screen.y} (x${screenScale}, ${ratio})   DTS: ${(
    round2dec(frameTimeMs * timeScale, dec) + ''
  ).padStart(5, ' ')}   FrameCount: ${fc}`
  ctx.fillText(info, xpos, 50)
  ctx.fillStyle = '#444'
  const ver = game.serverVersion
  ctx.fillText('' + ver, screen.x - ver.length * 27, 50)
}

export function renderProgressBar(
  pos: Vec2,
  label: string,
  amount: number,
  max: number,
  ctx: CanvasRenderingContext2D,
  redLevel = 60,
  warn = false,
  textWarnColor = '#7b7b7b'
): void {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  const linew = 8
  const w = 500
  const h = 50

  ctx.lineWidth = linew
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'

  if (amount < redLevel || (redLevel < 0 && amount > Math.abs(redLevel))) {
    // ctx.fillStyle = '#ffa500'
    ctx.fillStyle = '#ff0'
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
    ctx.fillStyle = '#600'
    p = w - linew
  }

  ctx.fillRect(Math.floor(linew / 2), Math.floor(linew / 2), p, h - Math.floor(linew / 2))

  ctx.lineWidth = 1
  ctx.strokeRect(w - Math.floor(linew / 2), Math.floor(linew / 2) + 1, 1, h - Math.floor(linew / 2) - 1)
  ctx.strokeRect(Math.floor(linew / 2), Math.floor(linew / 2) + 1, 1, h - Math.floor(linew / 2) - 1)

  setScaledFont(ctx)
  ctx.fillStyle = '#7b7b7b'
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

export function renderNumber(num: number, pos: Vec2, ctx: CanvasRenderingContext2D, angleAdjDeg = 0) {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(degToRad(angleAdjDeg))
  ctx.font = `bold 22px courier`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${num}`, 0, 0)
  ctx.restore()
}


export function renderVec2(str: string, pos: Vec2, ctx: CanvasRenderingContext2D, style: UIStyle, angleAdjDeg = 0) {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(degToRad(angleAdjDeg))
  ctx.fillStyle = style.starColor
  ctx.font = `bold 24px courier`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${str}`, 0, 0)
  ctx.restore()
}

export function renderRoundIndicator(
  centerPos: Vec2,
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
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.lineWidth = 8

  const ang1 = -240
  const meterAngleTest = round2dec(linearTransform(value, min, max, 0, -ang1), 0)
  const meterAngleTestStr = meterAngleTest + ''
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
  ctx.strokeStyle = '#c00'
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

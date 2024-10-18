import { describe, it, expect, expectTypeOf, vi, type MockInstance, beforeEach } from 'vitest'

import { Game } from '../game'
import { createSpaceObject } from '../factory'
import { DefaultSpaceModeKeyMap } from '../input'
import { OidsSocket, getWsUrl } from '../websocket/ws'
import { GameType } from '../interface'
import type { UIStyle } from '../interface'
import * as defaultColors from '../../style/defaultColors'
import { nextFrame, renderFrame } from '../gameModes/regular'
import { renderLoop } from '../time'

describe('game tests', () => {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas) // Append to body to simulate a DOM environment
  const localPlayer = createSpaceObject('')
  const socket = new OidsSocket(getWsUrl())

  function callback() {
    //
  }

  const newGame = new Game(canvas, localPlayer, socket, DefaultSpaceModeKeyMap, callback)

  it('game is initialized', () => {
    expect(newGame).toBeDefined()
  })

  it('ws is defined', () => {
    expect(newGame.websocket).toBeDefined()
  })

  it('canvas and context is defined', () => {
    expect(newGame.canvas.getContext('2d')).toBeDefined()
  })

  it('init state of properties', () => {
    expect(newGame.running).toBe(false)
    expect(newGame.type).toBe(GameType.SinglePlayer)
    expect(newGame.gameOver).toBe(false)
    expect(newGame.shouldSendToServer).toBe(false)
    expect(newGame.hasCalledCallback).toBe(false)
    expect(newGame.stopper).toBe(null)
    expect(newGame.serverVersion).toBeDefined()
    expectTypeOf(newGame.style).toMatchTypeOf<UIStyle>()
    expect(newGame.stars).toBeDefined()
  })

  // it('startGame', () => {
  //   expect(
  //     newGame.startGame(
  //       () => newGame,
  //       () => renderFrame(newGame, 60),
  //       () => nextFrame(newGame, 60)
  //     )
  //   ).not.toThrowError()
  // })
})

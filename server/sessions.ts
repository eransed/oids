import { StatusCodes } from 'http-status-codes'
import { Session, SpaceObject } from '../src/lib/interface'
import { ApiError } from './api/utils/apiError'
import { GameHandler } from './game_handler'
import { Client, createGame, getPlayersFromSessionId } from './main'

interface SessionHandler {
  startSessions: () => GameHandler[]
  updateAndGetSessions: (game_handler: GameHandler[]) => Map<string, Session>
  addSession: (Session: Session) => void
}

const serverNames: string[] = ['Kessel', 'Bespin', 'Lothal', 'Dagobah', 'Taris']

export function sessionHandler(): SessionHandler {
  let sessions: Map<string, Session> = new Map()

  const handler = {
    startSessions: () => {
      let gameHandlers: GameHandler[] = []

      for (let i = 0; serverNames.length > i; i++) {
        const session: Session = {
          id: serverNames[i],
          players: [],
        }

        sessions.set(serverNames[i], session)

        const newGameHandler = createGame(serverNames[i])

        gameHandlers.push(newGameHandler)
      }

      return gameHandlers
    },
    updateAndGetSessions: (game_handlers: GameHandler[]) => {
      try {
        for (let i = 0; game_handlers.length > i; i++) {
          const game_handler = game_handlers[i]

          if (game_handler.tied_session_id) {
            const players = getPlayersFromSessionId(game_handler.tied_session_id)

            sessions.set(game_handler.tied_session_id, { id: game_handler.tied_session_id, players: players })
          }
        }

        return sessions
      } catch (err) {
        throw new ApiError('Could not get sessions', StatusCodes.INTERNAL_SERVER_ERROR)
      }
    },
    addSession: (session: Session) => {
      sessions.set(session.id, session)
    },
  }

  return handler
}

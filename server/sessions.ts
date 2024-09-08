import { createSpaceObject } from '../src/lib/factory'
import { Session, SpaceObject } from '../src/lib/interface'
import { GameHandler } from './game_handler'
import { Client, createGame } from './main'

interface SessionHandler {
  startSessions: () => void
  getSessions: () => Session[]
  addSession: (Session: Session) => void
}

const serverNames: string[] = ['Kessel', 'Bespin', 'Lothal', 'Dagobah', 'Taris']

export function sessionHandler(game_handlers?: GameHandler[], clients?: Client[]): SessionHandler {
  let sessions: Session[] = []

  const handler = {
    startSessions: () => {
      for (let i = 0; serverNames.length > i; i++) {
        const gameHandler = new GameHandler((clients: Client[], data: SpaceObject, sessionId: string | null) => {})

        gameHandler.tied_session_id = serverNames[i]

        sessions.push({ id: serverNames[i], players: [] })
        console.log(sessions)

        gameHandler.game_session_start(serverNames[i])
        if (game_handlers) {
          game_handlers.push(gameHandler)
        }
      }
    },
    getSessions: () => {
      return sessions
    },
    addSession: (session: Session) => {
      sessions.push(session)
    },
  }

  return handler
}

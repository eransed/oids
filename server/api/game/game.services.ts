import { SpaceObject } from "../../../src/lib/interface"
import { getPlayersFromSessionId, getActivePlayerSessions } from "../../main"

interface ActiveSession {
  sessionId: string | null
  playerList: (SpaceObject | null)[]
}

export const getPlayerListFromSessionId = (sessionId: string | null): (SpaceObject | null)[] => {
  return getPlayersFromSessionId(sessionId)
}

export const getActiveSessions = (): ActiveSession[] => {
  const activeSessions: ActiveSession[] = []

  const sessions = getActivePlayerSessions()

  sessions.forEach((sessionId) => {
    const playerList = getPlayerListFromSessionId(sessionId)

    activeSessions.push({ sessionId: sessionId, playerList: playerList })
  })

  return activeSessions
}

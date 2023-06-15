import { Session } from "../../../src/lib/interface"
import { getActivePlayerSessions, getPlayersFromSessionId } from "../../main"

export const getActiveSessions = (): Session[] => {
  const activeSessions: Session[] = []

  const sessions = getActivePlayerSessions()

  sessions.forEach((sessionId) => {
    const playerList = getPlayersFromSessionId(sessionId)

    activeSessions.push({ sessionHost: "", sessionId: sessionId, playerList: playerList })
  })

  return activeSessions
}

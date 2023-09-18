import type { Session } from '../../lib/interface'
import { leaveSession } from './LobbyService'

export function checkJoinedSession(sessions: Session[]): void {
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i]
    if (s.id === $localPlayer.sessionId) {
      joinedSession = s
      checkReady()
      // log(`Joined session ${s.id}`)
      return
    }
  }
  console.log('No joined session/host closed the session')
  leaveSession()
}

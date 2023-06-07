import { getPlayersFromSessionId } from "../../main"

import type { Client } from "../../main"

export const getPlayerListFromSessionId = (sessionId: string | null): Client[] => {
  return getPlayersFromSessionId(sessionId)
}

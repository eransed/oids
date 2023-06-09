import { SpaceObject } from "../../../src/lib/interface"
import { getPlayersFromSessionId } from "../../main"

export const getPlayerListFromSessionId = (sessionId: string | null): (SpaceObject | null)[] => {
  return getPlayersFromSessionId(sessionId)
}

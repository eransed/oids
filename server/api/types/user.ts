import { SpaceObject } from "../../../src/lib/types"

export type User = {
  name: string
  id: string
  email: string
  password: string
  gameHistory?: SpaceObject[]
}

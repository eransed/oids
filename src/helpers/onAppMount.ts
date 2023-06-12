import { validateToken } from "../lib/services/utils/Token"

export const onAppMount = (): void => {
  validateToken()
}

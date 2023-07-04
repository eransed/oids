import { validateToken } from "../lib/services/utils/Token"

export const onAppMount = async (): Promise<void> => {
  await validateToken()
}

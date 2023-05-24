import { validateToken } from "../lib/services/utils/Token"

export const onAppMount = (): void => {
  console.log("App started...")
  console.log("Initiating frontend startup process")

  const validated = validateToken()

  validated.finally(() => console.log("Finished"))
}

interface Response {
  status: number
  data: {}
  error: string
}

interface Json {
  [k: string]: FormDataEntryValue
}

export const connectToLobbys = async (req: FormData): Promise<Response> => {
  const json = Object.fromEntries(req.entries())

  const getData = async (json: Json): Promise<Response> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let response: Response = {
          status: 0,
          data: {},
          error: "",
        }

        if (json.gameCode === "test") {
          response.status = 200
          response.data = {
            connected: true,
          }
          response.error
        } else response.status = 401

        resolve(response)
      }, 1000)
    })
  }

  const data = await getData(json)

  return data
}

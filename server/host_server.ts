import express from 'express'
import path from 'path'
import { log } from 'mathil'
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const pack = require("../package.json");
// const name_ver = `${pack.name} ${pack.version}`
const app = express()
const port = 3030
const root_dir = path.join(__dirname, '../../../dist')
const asset_path = '/assets'

export function start_host_server() {
  app.use(asset_path, express.static(path.join(root_dir, asset_path)))

  app.get('*', (req, res) => {
    log(`${new Date().toLocaleString()} | ${req.ip}: ${req.url}`)
    res.sendFile('index.html', { root: root_dir })
  })

  app.listen(port, () => {
    log(`Server running on port ${port} test`)
  })
}

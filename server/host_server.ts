import express from 'express'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const pack = require("../package.json");
// const name_ver = `${pack.name} ${pack.version}`
const app = express()
const port = 80
const root_dir = path.join(__dirname, '../../../dist')
const asset_path = '/assets'

export function start_host_server() {
    app.use(asset_path, express.static(path.join(root_dir, asset_path)))

    const roots = ['/', '/game']
    roots.forEach((root) => {
      console.log('adding ', root)
      app.get(root, (req, res) => {
        console.log (`${new Date().toLocaleString()} | ${req.ip}: ${req.url}`)
        res.sendFile('index.html', { root: root_dir })
      })
    })

    app.listen(port, () => {
      console.log(`Server running on port ${port} test`)
    })
}

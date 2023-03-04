import express from 'express'
import path from 'path'
const pack = require("../package.json");
const name_ver: string = `${pack.name} ${pack.version}`
const app = express()
const port = 80
const root_dir = path.join(__dirname, '../../dist')
const asset_path = '/assets'

export function start_host_server() {
    app.use(asset_path, express.static(path.join(root_dir, asset_path)))

    app.get('/', (req, res) => {
        console.log (`${new Date().toLocaleString()} | ${req.ip}: ${req.url}`)
        res.sendFile('index.html', { root: root_dir })
    })
    
    app.listen(port, () => {
      console.log(`${name_ver} running on port ${port}`)
    })
}

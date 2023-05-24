import "./app.css"
import App from "./App.svelte"

const app = new App({
  target: <HTMLCanvasElement>document.getElementById("app"),
})

export default app

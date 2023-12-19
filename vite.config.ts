import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '.env',

  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
  },
})

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, createLogger } from 'vite'

// Le backend tourne avec `nodemon`: chaque redemarrage coupe la websocket
// socket.io proxyee et Vite logge un stack trace "ws proxy (socket) error"
// ECONNABORTED/ECONNRESET sans consequence (le client socket.io retente seul).
// `proxy.on('error', ...)` dans `configure` ne suffit pas a le faire taire car
// Vite rattache son propre listener de log juste apres, donc on filtre au
// niveau du logger a la place.
const logger = createLogger()
const logError = logger.error.bind(logger)
logger.error = (msg, options) => {
  const isBenignWsProxyError =
    /^ws proxy(?: socket)? error:/.test(msg) &&
    /ECONNABORTED|ECONNRESET|ECONNREFUSED/.test(options?.error?.message ?? msg)
  if (isBenignWsProxyError) return
  logError(msg, options)
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },
})

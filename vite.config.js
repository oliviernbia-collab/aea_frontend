import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        // Evite le flot de stack traces "ws proxy error" quand le backend redemarre :
        // le client socket.io retente tout seul, il n'y a rien a corriger ici.
        configure: (proxy) => {
          proxy.on('error', () => {});
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/folders': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        // Pinned to 127.0.0.1 (not 'localhost'): Node resolves 'localhost' to
        // the IPv6 loopback first, which an unrelated Docker container can
        // also be bound to on this machine, silently shadowing Django on :8000.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})


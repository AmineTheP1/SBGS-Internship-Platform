import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      clientPort: 80,
      host: 'localhost',
      protocol: 'ws'
    },
    allowedHosts: ['stage.amineaichane.com']  
  },
  define: {
    'process.env': {}
  }
})

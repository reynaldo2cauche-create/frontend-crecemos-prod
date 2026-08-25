import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Servidor de desarrollo: permite exponerlo en la red / por túnel
  // para compartir el local sin desplegar. Solo afecta `npm run dev`.
  server: {
    port: 5174,          // puerto fijo para este proyecto (evita chocar con otro dev en 5173)
    host: true,          // escucha en la red (0.0.0.0), habilita la Network URL
    allowedHosts: true,  // acepta dominios de túnel (ngrok / trycloudflare, etc.)
  },
  // Servidor de la versión compilada (npm run preview): rápido a través de túnel.
  preview: {
    host: true,
    allowedHosts: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['exceljs'],
  },
  build: {
    rollupOptions: {
      output: {
        // Forzar que el hash cambie usando timestamp
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/QUEHAYHOY/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Escucha en 0.0.0.0 para acceso desde celular en la misma red
  },
})

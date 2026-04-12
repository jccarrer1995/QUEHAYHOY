import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/QUEHAYHOY/',
  plugins: [react(), tailwindcss()],
  server: {
    // Escucha en 0.0.0.0 para el móvil en la misma red. Ese host (p. ej. 192.168.x.x) debe estar en
    // Firebase Console → Authentication → Configuración → Dominios autorizados, o Auth fallará al usar Google.
    host: true,
  },
})

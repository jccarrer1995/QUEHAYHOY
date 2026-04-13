# Guía para Desarrolladores

**Versión:** 1.0  
**Última actualización:** Marzo 2026  
**Stack:** React 19 + TypeScript + Vite + Tailwind + Zustand + React Query

---

## Requisitos del entorno

| Herramienta | Versión requerida |
|-------------|------------------|
| Node.js     | 20.19+ o 22.12+ (recomendado: 24.x LTS) |
| npm         | 10.x o superior |

---

## Lo instalado hasta ahora

### Dependencias de producción

| Paquete      | Versión  | Descripción          |
|--------------|----------|----------------------|
| react        | ^19.2.4  | Librería React       |
| react-dom    | ^19.2.4  | Renderizado DOM      |
| firebase     | ^12.10.0 | Firestore, Auth, Cloud Functions |

### Dependencias de desarrollo

| Paquete                    | Versión  | Descripción                    |
|----------------------------|----------|--------------------------------|
| vite                       | ^8.0.0   | Bundler y dev server          |
| @vitejs/plugin-react       | ^6.0.0   | Plugin React para Vite        |
| tailwindcss                | ^4.2.2   | Estilos utility-first         |
| @tailwindcss/vite          | ^4.2.2   | Plugin Tailwind para Vite     |
| @types/react               | ^19.2.14 | Tipos TypeScript para React   |
| @types/react-dom           | ^19.2.3  | Tipos TypeScript para React DOM |
| eslint                     | ^9.39.4  | Linter                        |
| @eslint/js                 | ^9.39.4  | Configuración ESLint flat     |
| eslint-plugin-react-hooks  | ^7.0.1   | Reglas para hooks de React    |
| eslint-plugin-react-refresh| ^0.5.2   | Hot reload en desarrollo      |
| globals                    | ^17.4.0  | Variables globales para ESLint|

### Pendientes en el stack

- TypeScript
- Zustand
- React Query
- react-hook-form

---

## Comandos disponibles

| Comando         | Acción                              |
|-----------------|-------------------------------------|
| `npm run dev`   | Inicia el servidor de desarrollo    |
| `npm run build` | Compila para producción            |
| `npm run preview`| Previsualiza el build localmente    |
| `npm run lint`  | Ejecuta ESLint                      |

---

## Estructura del proyecto (ECUAMOMENT)

```
QUEHAYHOY/
├── docs/
│   └── GUIA-DESARROLLADORES.md
├── public/
├── src/
│   ├── components/
│   │   └── events/
│   │       ├── EventCard.jsx
│   │       └── index.js
│   ├── config/
│   │   ├── firebaseConfig.js
│   │   └── index.js
│   ├── contexts/
│   │   ├── ThemeContext.jsx
│   │   └── index.js
│   ├── hooks/
│   │   └── index.js
│   ├── lib/
│   │   └── index.js
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .cursor/rules/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## QUEHAYHOY – Firebase

Copia `.env.example` a `.env` y añade las credenciales del snippet **Web** en Firebase (las seis variables obligatorias; `measurementId` es opcional para Analytics).

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

**Colecciones Firestore:** events, categories, tags, users.

### Autenticación con Google

Implementación en `src/contexts/AuthContext.jsx` (`useAuth`, `signInWithGoogle`, `beginGoogleRedirect`, `logout`); perfil móvil en `useProfileGoogleSignIn.js`. Guía completa (popup unificado, redirect como respaldo, IP LAN, GitHub Pages): [`AUTENTICACION-GOOGLE-FIREBASE.md`](./AUTENTICACION-GOOGLE-FIREBASE.md).

# Autenticación con Google (Firebase Auth + Firestore)

Esta guía resume cómo está implementado el login en QUEHAYHOY, qué variables hacen falta y qué configurar en Firebase cuando desarrollas por **IP de red local** o despliegas en **GitHub Pages**.

---

## Archivos relevantes

| Archivo | Rol |
|---------|-----|
| `src/config/firebaseConfig.js` | Inicializa la app Firebase, Firestore (caché persistente multi-tab), `getAuth`, Functions y Analytics. Exige **seis** variables `VITE_FIREBASE_*` obligatorias. |
| `src/firebaseConfig.js` | Reexporta `auth`, `db`, etc. para importar desde un único punto (`@/` o rutas relativas). |
| `src/contexts/AuthContext.jsx` | `onAuthStateChanged`, `signInWithGoogle`, `beginGoogleRedirect`, `logout`, `useAuth`. |
| `src/lib/shouldUseGoogleRedirect.js` | Reservado para futuras heurísticas; hoy devuelve siempre `false` (mismo flujo **popup** que desktop). |
| `src/components/layout/useProfileGoogleSignIn.js` | Hook del botón Google en perfil móvil: delega en `signInWithGoogle` (popup + respaldo redirect en el contexto). |
| `src/components/layout/ProfileMenuContent.jsx` | Perfil móvil (`/perfil`): botón Google, resumen con sesión y **Cerrar sesión**. |
| `src/components/layout/DesktopProfileMenuContent.jsx` | Drawer desktop: mismo flujo + **Cerrar sesión** cuando hay sesión. |
| `src/components/layout/ProfileSignedInSummary.jsx` | Avatar circular + nombre cuando el usuario está autenticado. |
| `src/lib/authDisplayUser.js` | `useAuthUserForProfileHeader` + `useSyncExternalStore` sobre `onAuthStateChanged` y eventos **`visibilitychange` / `pageshow`** para refrescar el UID mostrado al volver del OAuth; `resolveAuthUserForDisplay` combina contexto y `auth.currentUser`. |

---

## Variables de entorno (`.env`)

Copia desde `.env.example`. Deben estar **todas** las claves del snippet web de Firebase (Configuración del proyecto → Tus apps → Web):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` (ej. `proyecto.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Opcional: `VITE_FIREBASE_MEASUREMENT_ID` (Analytics).

Si faltan campos críticos (sobre todo `authDomain` o `appId`), el SDK puede responder con `auth/configuration-not-found`.

---

## Firebase Console

1. **Authentication** → habilitar el producto si aún no está activo → **Sign-in method** → **Google** → activar.
2. **Authentication** → **Configuración** → **Dominios autorizados**:
   - Incluye `localhost` (desarrollo).
   - Para probar desde el móvil con Vite (`server.host: true`), entras por una **IP de LAN** (ej. `http://192.168.1.10:5173`). Añade **solo el hostname** en dominios autorizados: `192.168.1.10` (sin `http://` ni puerto).
   - Para **GitHub Pages**, añade el dominio que sirve la app (ej. `usuario.github.io` si usas `https://usuario.github.io/QUEHAYHOY/`).

Si el origen no está autorizado, el SDK falla en validación de origen (`auth/unauthorized-domain`); la app muestra un toast explicativo.

---

## Popup vs redirect

- **Todos los dispositivos (incluido móvil):** el flujo principal es **`signInWithPopup`** (ventana o pestaña de cuentas de Google, igual que en desktop).
- **Respaldo automático:** si el SDK devuelve `auth/popup-blocked` o `auth/operation-not-supported-in-this-environment`, `signInWithGoogle` usa **`signInWithRedirect`** en la misma pestaña.
- **`beginGoogleRedirect()`:** API pública por si en el futuro se vuelve a un redirect explícito desde la UI; debe llamarse **síncronamente** desde el `onClick` si se usa (sin `setState` previo ni `await` antes), para que iOS no cancele la navegación OAuth.

Antes de **`signInWithRedirect`** (respaldo) se guardan en `sessionStorage` la ruta (`qh_auth_return`) y el flag `qh_oauth_return_pending`. Al volver de Google se restaura la ruta **solo si** ese flag está activo; el login con **popup** no activa ese flag de forma innecesaria, para no forzar navegación a `/perfil`.

Tras el retorno de Google (redirect), el flujo usa `auth.authStateReady()`, luego `getRedirectResult(auth)`, una pasada **`syncSessionFromAuth()`** (lee `auth.currentUser` por si el redirect ya se consumió pero la sesión existe) y después `onAuthStateChanged`. En Safari móvil, al volver de cuentas.google.com la página puede restaurarse desde **bfcache** sin re-ejecutar efectos: por eso también se escucha **`pageshow`** en `AuthContext` y en la suscripción de `authDisplayUser.js`. Tras `signInWithPopup` se hace `setUser` explícito para no depender solo del listener.

---

## Firestore: colección `users`

Al iniciar sesión (popup o redirect), si no existe un documento `users/{uid}`, se crea con rol por defecto **`Asistente`** y datos básicos del perfil de Google.

Las **reglas de seguridad** de Firestore deben permitir al usuario autenticado leer/escribir (o al menos crear) su propio documento según la política del proyecto.

---

## Despliegue (GitHub Pages)

El proyecto usa `base: '/QUEHAYHOY/'` en Vite y `BrowserRouter` con el mismo `basename`.

```bash
npm run deploy
```

Eso ejecuta `predeploy` → `npm run build` y publica la carpeta `dist` con **gh-pages** en la rama configurada (habitualmente `gh-pages`). Requiere permisos de push al remoto y que el repositorio tenga habilitado Pages apuntando a esa rama o a la carpeta correcta.

Tras publicar, añade en Firebase **Dominios autorizados** el host real de la PWA (p. ej. `usuario.github.io`).

---

## Referencias

- [Firebase Auth Web: redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Dominios autorizados](https://firebase.google.com/docs/auth/web/redirect-best-practices) (misma guía; sección de dominios)

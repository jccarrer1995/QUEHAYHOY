# QUEHAYHOY

**Descubre eventos y planes en Guayaquil** — App móvil (PWA) para recomendar planes de fin de semana basados en eventos locales.

---

## Stack

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Estado:** ThemeContext, AuthContext

---

## Lo que hemos construido (en orden)

### 1. Proyecto base
- Clonado del repositorio e instalación de React con Vite
- Configuración de Node.js 24 LTS

### 2. Reglas y estándares
- Reglas de Cursor (`.cursor/rules/coding-standards.mdc`)
- Guía para desarrolladores (`docs/GUIA-DESARROLLADORES.md`)
- Estándares: TypeScript estricto, Tailwind, modo claro/oscuro obligatorio

### 3. Diseño y branding
- Branding **QUEHAYHOY** (reemplazando referencias previas)
- Paleta: fondo `#121212`, texto `#E0E0E0`, acento teal `#14b8a6`
- Modo Nocturno con toggle persistente en `localStorage`
- PWA: `manifest.json` y metadatos HTML para instalación en iPhone/Android

### 4. Componentes
- **Navbar:** Logo QUEHAY/HOY, buscador ("¿Qué quieres hacer hoy en Guayaquil?"), campana, login
- **CategorySelector:** Bares, Conciertos, Comida, Cine, Ferias (tarjetas con iconos)
- **EventCardCarousel:** Imagen, título, badge de aforo (✨ Exclusivo, 👥 Social, 🔥 Masivo), fecha, ubicación, precio
- **FloatingButtons:** Tema (☀️/🌙), Filter, Gratis — solo móvil
- **BottomNav:** Inicio, Explorar, Notificaciones, Perfil

### 5. Badges de Aforo
- **✨ Exclusivo:** &lt;30 personas (dorado)
- **👥 Social:** 30–150 personas (azul)
- **🔥 Masivo:** &gt;400 personas (rojo)

### 6. Firebase
- Conexión a Firestore (colección `events`)
- Campos mapeados: `title`, `location` → sector, `date`, `capacity_level`, `price`, `image_url`
- Login con Google (Acceso Progresivo: solo se solicita para guardar favoritos)
- Hook `useEvents` con `getDocs` para cargar eventos en tiempo real
- Estados de loading y error en la UI

### 7. UX móvil
- Diseño mobile-first responsive
- Carrusel horizontal de eventos en móvil, grid en desktop
- Padding inferior para evitar que los FABs tapen el contenido al hacer scroll en iPhone

---

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/     # Navbar, BottomNav, FloatingButtons
│   └── events/     # EventCardCarousel, CategorySelector
├── config/         # firebaseConfig
├── contexts/       # ThemeContext, AuthContext
├── hooks/          # useEvents
└── ...
```

---

## Próximos pasos sugeridos

- [ ] Autenticación con Apple
- [ ] Guardar planes/favoritos (requiere login)
- [ ] Filtros por sector (Urdesa, Samborondón, Puerto Santa Ana)
- [ ] Mapa interactivo
- [ ] Notificaciones Push (FCM)
- [ ] Integración completa con Firestore para categorías y tags

# QUEHAYHOY

**Descubre eventos y planes en Guayaquil** — App responsive (PWA) para descubrir eventos, conciertos y planes locales con experiencia mobile-first y soporte desktop.

---

## Stack

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Routing:** React Router DOM
- **Estado:** ThemeContext, AuthContext, SectorVisibilityContext (visibilidad de sectores en `localStorage`)
- **UX/Animaciones:** Framer Motion
- **Notificaciones:** Sonner (toasts)

---

## Lo que hemos construido (en orden)

### 1. Proyecto base
- Clonado del repositorio e instalación de React con Vite
- Configuración de Node.js LTS para desarrollo local

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
- **Navbar:** Logo QUEHAY/HOY, buscador, campana (planes recientes), tema y menú hamburguesa en desktop
- **CategorySelector:** Bares, Conciertos, Comida, Cine, Ferias (tarjetas con iconos)
- **EventCardCarousel:** Imagen, título, badge de aforo (✨ Exclusivo, 👥 Social, 🔥 Masivo), fecha, ubicación, precio
- **FloatingButtons:** Tema (☀️/🌙), Filter, Gratis — solo móvil
- **BottomNav:** Inicio, Explorar, Favoritos (en construcción), **Perfil** → `/perfil`
- **TodaySection / HorizontalEventRow:** carruseles reactivos al buscador y a sectores favoritos
- **ProfileMenuContent / DesktopProfileMenuContent:** perfil móvil y drawer desktop desacoplados
- **Footer:** footer exclusivo para desktop con bloque editorial y enlaces legales
- **LegalBottomSheet / LegalPage:** contenido legal consistente entre móvil y desktop

### 5. Badges de Aforo
- **✨ Exclusivo:** &lt;30 personas (dorado)
- **👥 Social:** 30–150 personas (azul)
- **🔥 Masivo:** &gt;400 personas (rojo)

### 6. Firebase
- Conexión a Firestore (colección `events`)
- Campos mapeados: `title`, `location` → sector, `date`, `capacity_level`, `price`, `image_url`, `slug`, `isVisible`
- **Login con Google** (`AuthContext`): sesión persistente, documento en `users/{uid}` con rol **Asistente** por defecto, **`signInWithPopup`** en todos los tamaños de pantalla (redirect solo como respaldo si el popup falla); perfil con avatar y cierre de sesión. Detalle: [`docs/AUTENTICACION-GOOGLE-FIREBASE.md`](docs/AUTENTICACION-GOOGLE-FIREBASE.md).
- **Favoritos con sesión**: con usuario autenticado, los IDs favoritos se guardan en Firestore (`users/{uid}.favoriteEventIds`). Sin sesión no se persisten favoritos; la UI invita a iniciar sesión (pantalla `/favoritos`, bottom sheet al tocar el corazón, y muros en rutas de preferencias si alguien entra sin login). Los datos antiguos en `localStorage` (`favoritos_qhhy`) se fusionan una vez al iniciar sesión. Las reglas de Firestore deben permitir que cada usuario actualice su documento en `users`.
- Hook `useEvents` con `getDocs` para cargar eventos en tiempo real
- Estados de loading y error en la UI

### 7. UX móvil
- Diseño mobile-first responsive
- Carrusel horizontal de eventos en móvil, grid en desktop
- Padding inferior para evitar que los FABs tapen el contenido al hacer scroll en iPhone

### 8. SEO, rutas y descubrimiento
- URLs amigables para eventos con formato `/evento/:categoria/:slug`
- Compatibilidad legacy para eventos antiguos por `/evento/:id`
- Página dedicada de detalle de evento y página de colecciones especiales
- Rutas legales semánticas (`/legal/...`) para desktop y SEO básico

---

## Requisitos del entorno

- **Node.js:** `20.19+` o `22.12+`
- **npm:** versión incluida con una instalación reciente de Node LTS

> Importante: el proyecto usa `Vite 8`, así que con `Node 20.17.0` o inferiores el comando `npm run build` puede fallar por incompatibilidad de versión.

## Instalación y ejecución

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Mantenimiento de dependencias

- Ejecuta `npm audit` para revisar vulnerabilidades conocidas.
- Si aparecen dependencias vulnerables con arreglo disponible, puedes probar `npm audit fix`.
- Después de actualizar dependencias, valida siempre con `npm run build`.

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

Las seis primeras son **obligatorias** para inicializar Auth y Firestore; ver `.env.example` y la guía de autenticación.

# Cloudinary (subida de imágenes)
VITE_CLOUDINARY_CLOUD_NAME=dfyp1q7tl
VITE_CLOUDINARY_UPLOAD_PRESET=quehayhoy_images

# Google Maps (pantalla Explorar; Maps JavaScript API en Google Cloud)
VITE_GOOGLE_MAPS_API_KEY=

# Opcional: versión mostrada en «Acerca de» (por defecto en código: V0.0.2 en appVersion.js)
# VITE_APP_VERSION=V0.0.2
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/     # Navbar, BottomNav, AppToaster
│   ├── events/     # carruseles, CategorySelector, SectorSelector, TodaySection…
│   ├── explore/    # ExploreMapView (Google Maps), ExploreEventMiniCard (resumen al tocar pin)…
│   └── legal/      # LegalBottomSheet (términos, privacidad, acerca de)
├── config/         # firebaseConfig
├── contexts/       # ThemeContext, AuthContext, SectorVisibilityContext, CategoryVisibilityContext, FavoriteEventsContext, FavoriteLoginPromptContext
├── hooks/          # useEvents, useEphemeralNotifications…
├── lib/            # topSectors, appVersion, utilidades compartidas
├── pages/          # App (home vía ruta /), ProfilePage, FavoriteSectorsPage, FavoriteCategoriesPage, FavoriteEventsPage, EventDetailPage…
└── ...
```

### Rutas útiles (usuario)

| Ruta | Descripción |
|------|-------------|
| `/` | Home (eventos, categorías, sectores) |
| `/favoritos` | Favoritos: con sesión lista eventos marcados con el corazón (Firestore); sin sesión, pantalla de bienvenida e inicio de sesión |
| `/perfil` | Cuenta, Google, configuración y legales |
| `/perfil/sectores` | Sectores favoritos: mostrar/ocultar en el carrusel del inicio |
| `/perfil/categorias` | Categorías favoritas: mostrar/ocultar categorías y eventos relacionados en Home |
| `/evento/:categoria/:slug` | Detalle público de evento con URL amigable |
| `/evento/:id` | Compatibilidad con eventos legacy |
| `/coleccion/:id` | Página de colección especial |
| `/legal/terminos-y-condiciones` | Página legal semántica |
| `/legal/politica-de-privacidad` | Página legal semántica |
| `/legal/acerca-de-la-app` | Página legal semántica |

---

## Funcionalidades implementadas (en orden)

### 1) Descubrimiento de eventos
- Home con secciones de descubrimiento y filtros por categorías/sectores.
- Bloque “¿No sabes a dónde ir?” con selección aleatoria de evento.
- Sección “Más eventos” para no perder contenido fuera de los bloques principales.

### 2) Detalle de evento y rutas públicas
- Detalle en página dedicada con carga por documento y estados de `loading/error`.
- URLs amigables con slug: `/evento/:categoria/:slug`.
- Compatibilidad con eventos legacy por ID: `/evento/:id`.
- Acciones en detalle: abrir en Google Maps y compartir por WhatsApp.

### 3) Gestión de favoritos y preferencias
- Favoritos con corazón en cards (`EventCard`, `EventCardCarousel`) y vista `/favoritos`.
- Sin sesión: flujo guiado a login (wall + bottom sheet de autenticación).
- Con sesión: favoritos persistidos en `users/{uid}.favoriteEventIds`.
- Preferencias de sectores/categorías desde perfil con persistencia y efecto en Home.

### 4) Autenticación y perfil
- Google Sign-In integrado con Firebase Auth, sesión persistente y restauración de ruta tras OAuth.
- Creación/actualización de documento de usuario en `users/{uid}`.
- Menús de perfil móviles y desktop con resumen de usuario y cierre de sesión.
- Secciones legales integradas en perfil y rutas semánticas en desktop.

### 5) Admin de eventos (CRUD)
- Dashboard admin en `/wp-admin` con tabla paginada.
- Crear, editar, eliminar y alternar visibilidad (`isVisible`) de eventos.
- Formulario de admin con validaciones de título, descripción y fechas.
- Soporte de imagen con Cloudinary y generación de `slug` único.

### 6) Modelo de roles y permisos de gestión
- Rol `organizador`: gestiona solo sus eventos (`createdByUid`) y aplica cuota por plan.
- Rol `administrador`: acceso de gestión global y visibilidad de todos los eventos.
- Guard de rutas (`RequireOrganizador`) habilita acceso a organizador y administrador.
- En edición, un organizador no puede modificar eventos de otro usuario.
- Eventos legacy sin `createdByUid`: solo administrador puede editarlos.

### 7) Mis eventos y cuota mensual
- Ruta `/mis-eventos` para gestión de catálogo según rol:
  - Administrador: lista global.
  - Organizador: solo eventos propios.
- Ruta `/mis-eventos/crear` para alta de nuevos eventos.
- Cuota mensual mostrada únicamente para organizador con plan activo.

### 8) Pantalla Explorar con mapa
- Integración de Google Maps con marcadores por categoría.
- Etiquetas de eventos junto al pin (con umbral de zoom configurable).
- Mini card inferior con resumen del evento seleccionado y acceso a detalle.
- Requiere `VITE_GOOGLE_MAPS_API_KEY`.

### 9) Firestore: consultas, rendimiento y resiliencia
- Consultas adaptadas al modelo `unique/recurring` y visibilidad (`isVisible`).
- Índices en `firestore.indexes.json` para soportar consultas compuestas.
- Cache local persistente y soporte multi-tab.
- Manejo de errores transitorios de Firestore en lecturas críticas.

### 10) UI/UX transversal
- Mobile-first con soporte desktop.
- Modo claro/oscuro consistente en componentes y pantallas clave.
- Safe area en iPhone para headers/acciones en pantallas de detalle y colecciones.
- Toaster global para feedback contextual.

## Pendiente para completar

- Integrar notificaciones push con FCM.
- Completar integración de categorías y tags 100% desde Firestore.
- Definir y ejecutar estrategia de migración para eventos legacy sin `createdByUid`.
- Evaluar autenticación adicional (por ejemplo, Apple Sign-In).

---

## Despliegue (GitHub Pages)

El `base` de Vite es `/QUEHAYHOY/` (subruta en Pages). Tras configurar el remoto y Pages en GitHub:

```bash
npm run deploy
```

Publica el contenido de `dist` mediante **gh-pages**. Añade el dominio público en **Firebase → Authentication → Dominios autorizados**. Más detalle en [`docs/AUTENTICACION-GOOGLE-FIREBASE.md`](docs/AUTENTICACION-GOOGLE-FIREBASE.md).

---

## Próximos pasos sugeridos

- [ ] Autenticación con Apple
- [x] Guardar planes/favoritos con cuenta (Google + Firestore `favoriteEventIds`)
- [x] Mapa interactivo (pantalla Explorar con Google Maps; requiere `VITE_GOOGLE_MAPS_API_KEY`)
- [ ] Notificaciones Push (FCM)
- [ ] Integración completa con Firestore para categorías y tags

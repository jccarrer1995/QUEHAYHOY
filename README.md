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
- **Navbar:** Logo QUEHAY/HOY, buscador, campana (planes recientes), tema y menú hamburguesa en desktop; segunda fila opcional bajo el buscador (`mobileHomeFilters`) **sticky** con el header — visible en **móvil y desktop** en Home
- **HomeMobileFilters (Home):** label «Filtrar» con icono, **pills** horizontales (categoría y sector). Cada pill abre un **sheet** (bottom en móvil, centrado en desktop) con el selector correspondiente, botón «Aplicar» y cierre sin aplicar. Los pills muestran **Categoría** / **Sector** cuando el filtro está en «todo», o el **nombre de la opción** aplicada; si hay filtro activo el pill usa el **acento teal** y texto blanco. Los chips del sheet usan scroll horizontal (`HorizontalScrollRow`: rueda, arrastre y touch)
- **CategorySelector / SectorSelector:** variante `toolbar` (fila con etiqueta) y variante `sheet` (solo chips, sin título duplicado en el sheet)
- **HorizontalScrollRow:** fila con scroll horizontal reutilizable (carruseles de chips en sheets de filtros)
- **CategorySelector:** Bares, Conciertos, Comida, Cine, Ferias (tarjetas con iconos)
- **EventCardCarousel:** Imagen, título, badge de aforo (✨ Exclusivo, 👥 Social, 🔥 Masivo), fecha, ubicación, precio
- **FloatingButtons:** Tema (☀️/🌙), Filter, Gratis — solo móvil
- **BottomNav:** Inicio, Explorar, Favoritos (en construcción), **Perfil** → `/perfil`. Con rol **Admin**: Inicio, **Eventos**, **Moderación**, Perfil (sin Explorar ni Favoritos)
- **TodaySection / HorizontalEventRow:** carruseles reactivos al buscador y a sectores favoritos
- **DesktopNavbar:** wrapper del `Navbar` visible solo en `md+` para rutas fuera del Home
- **EventCatalogToolbar:** select «Ordenar por» + botones grid/list en catálogos de eventos
- **PreferenceSettingsPanel / PreferenceVisibilitySwitch:** shell de preferencias de sectores y categorías
- **OrganizerEventListMenu:** menú ⋮ con Editar/Eliminar en listado de Mis eventos
- **ProfileMenuContent / DesktopProfileMenuContent:** perfil móvil (`/perfil`) y drawer desktop (hamburguesa) desacoplados; el drawer replica las secciones del perfil responsive con menú de navegación al inicio. Con rol **Admin**, la sección **Configuración** se sustituye por **Administrar** (Organizadores, Eventos, Moderación, Sectores, Categorías)
- **DeleteAccountConfirmDialog:** modal de confirmación para eliminación de cuenta
- **Footer:** footer exclusivo para desktop con bloque editorial y enlaces legales
- **OrganizerPromoBanner:** carrusel horizontal deslizable (asistente logueado) con promo «Subir eventos» y planes Estándar/Pro; cards más grandes y badge **Mejor valor** legible en plan Pro
- **LegalPage:** páginas legales dedicadas (`/legal/*`) con header compacto en móvil

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
- Filtros de categoría y sector en Home replican patrón tipo app de delivery: barra compacta bajo el buscador (sticky con el `Navbar`), sheets modales con Framer Motion y contraste explícito en títulos para tema claro con `prefers-color-scheme: dark`. En **desktop** el mismo bloque de filtros vive en el `Navbar` (ya no hay selectores duplicados en el `main` del Home)
- La sección **«¡Pilas Hoy!»** (`TodaySection`) no muestra línea separadora superior respecto al bloque anterior

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
│   ├── layout/     # Navbar (opc. `mobileHomeFilters` sticky), BottomNav, DesktopProfileMenuContent, DeleteAccountConfirmDialog…
│   ├── events/     # carruseles, EventCatalogToolbar, HomeMobileFilters, HorizontalScrollRow, CategorySelector…
│   ├── explore/    # ExploreMapView (Google Maps), ExploreEventMiniCard (resumen al tocar pin)…
│   ├── legal/      # LegalBottomSheet (términos, privacidad, acerca de)
│   ├── organizer/  # OrganizerPromoBanner, OrganizerQuotaCard, OrganizerEventListMenu…
│   └── auth/       # RequireOrganizador, RequireAdministrator
├── config/         # firebaseConfig
├── contexts/       # ThemeContext, AuthContext, SectorVisibilityContext, CategoryVisibilityContext, FavoriteEventsContext, FavoriteLoginPromptContext
├── hooks/          # useEvents, useEphemeralNotifications…
├── lib/            # eventSort, eventExpiration, topSectors, sectorZoneBadges, appVersion…
├── pages/          # App (home vía ruta /), AdminMasterDashboard, ModeracionScreen, ProfilePage, FavoriteSectorsPage…
└── ...
```

### Rutas útiles (usuario)

| Ruta | Descripción |
|------|-------------|
| `/` | Home (eventos, categorías, sectores). Con rol **Admin** → **Dashboard** con KPIs y gráficos |
| `/admin/moderacion` | Centro de Moderación (Admin): pestañas Eventos/Organizadores, revisión en modal y aprobación con animación |
| `/admin/organizadores` | Gestión de organizadores (Admin, placeholder) |
| `/favoritos` | Favoritos: con sesión lista eventos marcados con el corazón (Firestore); sin sesión, pantalla de bienvenida e inicio de sesión |
| `/perfil` | Cuenta, Google, configuración y legales |
| `/historial-eventos` | Historial de eventos (organizador): antiguos y nuevos |
| `/perfil/suscripcion-plan` | Suscripción/Plan (organizador): vista mock de plan y pagos |
| `/perfil/metricas-rendimiento` | Métricas (organizador): vista mock con alcance/interacciones del mes |
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
- **Promo organizador (asistente logueado):** debajo del bloque «Sorpréndeme», carrusel horizontal con 3 cards (promo + planes Estándar/Pro), deslizable como los eventos.

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

**Actualización (avance reciente):**
- **`/favoritos` — toolbar compartido** (`EventCatalogToolbar`):
  - **Ordenar por** (select): Fecha mayor/menor, Precio menor/mayor, Finalizados al final.
  - **Vista** (iconos): cuadrícula o listado compacto.
- **Listado en favoritos:** filas con título, sector, fecha, precio, corazón inline y badge de categoría.
- **Ordenamiento** (`lib/eventSort.js`): los eventos **expirados siempre al final**, sin importar el criterio elegido; el orden se aplica por separado dentro de vigentes y dentro de expirados.
- **`/perfil/sectores` y `/perfil/categorias` — UI compacta** (`PreferenceSettingsPanel`):
  - Contenedor `max-w-xl`, tarjeta con `divide-y`, switches teal y botón «Guardar Preferencias».
  - Filas con icono, badge de zona/tipo y scroll corregido en desktop.
  - `DesktopNavbar` en pantallas de preferencias y muros de invitado (`GuestPreferenceWall`).

### 4) Autenticación y perfil
- Google Sign-In integrado con Firebase Auth, sesión persistente y restauración de ruta tras OAuth.
- Creación/actualización de documento de usuario en `users/{uid}`.
- Menús de perfil móviles y desktop con resumen de usuario y cierre de sesión.
- Secciones legales integradas en perfil y rutas semánticas en desktop.

**Actualización (avance reciente):**
- **Eliminar cuenta** en `/perfil` (sección Cuenta): modal de confirmación, borrado en Firebase Auth, documento `users/{uid}` y registro lógico en `historical_trials` para bloquear reutilización de trial (`accountDeletion.js`, `AuthContext.deleteAccount`).
- **Drawer desktop** (`DesktopProfileMenuContent`, botón hamburguesa del `Navbar`):
  - Ancho compacto **300px**, tipografía y espaciados reducidos; perfil con variante `compact` en `ProfileSignedInSummary`.
  - Scrollbar fino siempre visible al **borde derecho** del panel (utilidad `.scrollbar-thin` en `index.css`).
  - Misma estructura que el perfil responsive, con sección **Menú** al inicio: **Home**, **Explorar**, **Favoritos** (Admin: **Home** y **Moderación**); luego **Configuración** o **Administrar** (Admin), **Gestión** (organizador), **Legal** y **Cuenta** (cerrar sesión + eliminar cuenta).
  - Sheets legales y diálogo de eliminación de cuenta integrados en el drawer.

### 5) Admin de eventos (CRUD)
- Dashboard admin en `/wp-admin` con tabla paginada.
- Crear, editar, eliminar y alternar visibilidad (`isVisible`) de eventos.
- Formulario de admin con validaciones de título, descripción y fechas.
- Soporte de imagen con Cloudinary y generación de `slug` único.

### 6) Modelo de roles y permisos de gestión
- Rol `organizador`: gestiona solo sus eventos (`createdByUid`) y aplica cuota por plan.
- Rol **`Admin`** (Firestore): Super Admin con acceso global a la plataforma, dashboard en `/` y rutas `/admin/*`.
- Guard de rutas (`RequireOrganizador`) habilita acceso a organizador y administrador.
- Guard **`RequireAdministrator`** protege rutas exclusivas de Admin (`/admin/moderacion`, `/admin/organizadores`).
- En edición, un organizador no puede modificar eventos de otro usuario.
- Eventos legacy sin `createdByUid`: solo administrador puede editarlos.

**Actualización (panel Admin):**
- **Dashboard en inicio** (`AdminMasterDashboard`): KPIs en grid 2×2 (usuarios, organizadores, eventos, ingresos — demo), gráficos de crecimiento usuarios vs organizadores; sin splash móvil de bienvenida.
- **Centro de Moderación** (`ModeracionScreen`, `/admin/moderacion`): pestañas **Eventos (n)** / **Organizadores (n)**, panel de revisión al pulsar **Revisar**, aprobación simulada con animación de salida de la tarjeta.
- **Navegación Admin:** bottom nav Inicio · Eventos · Moderación · Perfil; drawer desktop con **Moderación** en Menú; perfil con sección **Administrar** (sin Explorar/Favoritos).
- En `/mis-eventos`, el título muestra **Eventos** (no «Mis Eventos») para Admin.
- Navbar en home Admin: sin buscador ni filtros del topbar.

### 7) Mis eventos y cuota mensual
- Ruta `/mis-eventos` para gestión de catálogo según rol:
  - Administrador: lista global.
  - Organizador: solo eventos propios.
- Ruta `/mis-eventos/crear` para alta de nuevos eventos.
- Cuota mensual mostrada únicamente para organizador con plan activo.

**Actualización (avance reciente):**
- En `/mis-eventos` (organizador) se muestran **solo los eventos creados en el mes actual** (filtrado por `createdAt`).
- Botón **flotante** (FAB) redondo con icono **+** para crear evento, ubicado **encima del BottomNav** en móvil.
- Nueva ruta `/historial-eventos` para ver **todos** los eventos (antiguos y nuevos).
- **Bloqueo mismo día del evento** (organizador): no puede editar ni eliminar un evento programado para el día actual (`eventExpiration.js`); la UI muestra acciones deshabilitadas con tooltip/toast en cards, listado y formulario de edición.
- **Toolbar** (`EventCatalogToolbar`): mismo select **Ordenar por** y toggle grid/list que en favoritos.
- **Vista listado:** filas alineadas con favoritos; acciones vía menú **⋮** (`OrganizerEventListMenu`) con opciones Editar y Eliminar (misma lógica de bloqueo y diálogo de confirmación que en cards).
- **Vista cuadrícula:** hasta **4 columnas** en `xl` (`xl:grid-cols-4`); 1 en móvil, 2 en `sm`, 3 en `lg`.
- **Eventos expirados** en cards: badge «Expirado», sin favorito ni acciones de edición/eliminación; en listado, badge y fila no navegable al detalle.
- **`DesktopNavbar`** visible en `/mis-eventos`, `/historial-eventos` y rutas de perfil relacionadas; buscador del navbar solo en Home.

### 7.1) Perfil (organizador): sección “Gestión”
- En `/perfil` (organizador) se muestra una agrupación **Gestión** (debajo de Configuración y encima de Legal) con:
  - **Historial** → `/historial-eventos`
  - **Mi Suscripción / Plan** → `/perfil/suscripcion-plan` (mock estilo Uber: Plan Pro $7.99, ciclo, método de pago Visa ••••3002, cambiar/cancelar)
  - **Métricas y Rendimiento** → `/perfil/metricas-rendimiento` (métricas hardcodeadas por ahora)

### 8) Pantalla Explorar con mapa
- Integración de Google Maps con marcadores por categoría.
- Etiquetas de eventos junto al pin (con umbral de zoom configurable).
- Mini card inferior con resumen del evento seleccionado y acceso a detalle.
- Requiere `VITE_GOOGLE_MAPS_API_KEY`.

### 8.1) Home: Colecciones Especiales (curado)
- En el Home, la sección **Colecciones Especiales** muestra **solo 3 cards**: las más cercanas **desde hoy en adelante**.

### 8.2) Home: filtros en desktop
- Los filtros de categoría y sector del Home (`HomeMobileFilters`) se muestran también en **desktop**, en la fila sticky bajo el buscador del `Navbar`.
- Al pulsar **Categoría** o **Sector** se abre un modal centrado (fade + escala) con chips scrolleables horizontalmente.
- Se eliminaron los selectores duplicados que antes vivían en el `main` de `App.jsx` solo para `md+`.

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
- Utilidad CSS `.scrollbar-thin` para scrollbars discretos en paneles laterales (drawer de perfil desktop).

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

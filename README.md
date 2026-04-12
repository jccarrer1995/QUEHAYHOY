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
- **Login con Google** (`AuthContext`): sesión persistente, documento en `users/{uid}` con rol **Asistente** por defecto, popup en desktop y **redirect** en móvil / IP LAN; perfil con avatar y cierre de sesión en desktop. Detalle: [`docs/AUTENTICACION-GOOGLE-FIREBASE.md`](docs/AUTENTICACION-GOOGLE-FIREBASE.md).
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
│   └── legal/      # LegalBottomSheet (términos, privacidad, acerca de)
├── config/         # firebaseConfig
├── contexts/       # ThemeContext, AuthContext, SectorVisibilityContext, CategoryVisibilityContext, FavoriteEventsContext
├── hooks/          # useEvents, useEphemeralNotifications…
├── lib/            # topSectors, appVersion, utilidades compartidas
├── pages/          # App (home vía ruta /), ProfilePage, FavoriteSectorsPage, FavoriteCategoriesPage, FavoriteEventsPage, EventDetailPage…
└── ...
```

### Rutas útiles (usuario)

| Ruta | Descripción |
|------|-------------|
| `/` | Home (eventos, categorías, sectores) |
| `/favoritos` | Página de eventos guardados localmente desde el corazón de las cards |
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

## Actualizaciones recientes

### 1) Favoritos locales, categorías favoritas y navegación (08/04/2026)
- **Favoritos locales**: se añadió un sistema de favoritos en cliente con `localStorage` usando la clave `favoritos_qhhy`, sin requerir autenticación.
- **Cards de eventos**: `EventCard` y `EventCardCarousel` ahora muestran un corazón en la esquina superior derecha con estado `outline`/relleno, color de acento y micro-interacción al presionarlo.
- **Nueva página `/favoritos`**: se creó `FavoriteEventsPage` para listar eventos guardados localmente; en móvil mantiene `BottomNav` visible y activa el tab de favoritos.
- **Bottom navigation**: el item **Favoritos** del menú inferior ahora abre una vista real y usa icono de corazón.
- **Menú de perfil**: se añadió **Categorías Favoritas** en móvil y desktop, y **Favoritos** del menú desktop también navega a la nueva página.
- **Categorías favoritas**: se añadió `CategoryVisibilityContext` y la ruta `/perfil/categorias`; las categorías arrancan activadas por defecto y, al desactivarlas, desaparecen sus chips y eventos del Home, `Pilas Hoy` y colecciones.
- **Sectores favoritos**: se refinó la cabecera de la pantalla para una experiencia más compacta y con comportamiento de título dinámico al hacer scroll.
- **Documentación de entorno**: se actualizó el README con requisitos de Node para la versión actual de Vite y notas de mantenimiento de dependencias.

### 2) Ajustes del 06/04/2026
- **Slugs para eventos**: se implementó `src/lib/slug.js` para generar slugs únicos, construir rutas amigables y compartir URLs públicas consistentes.
- **Rutas nuevas**: el detalle de evento ya soporta `/evento/:categoria/:slug` y mantiene fallback por ID para eventos antiguos.
- **Admin**: al crear o editar eventos desde `AdminEventForm`, ahora también se genera y persiste el campo `slug`.
- **Filtros del home**: los sectores favoritos ahora afectan tanto a los chips visibles como a los eventos mostrados en Home, `Pilas Hoy` y colecciones.
- **Buscador + Pilas Hoy**: el buscador principal del home ya filtra también los eventos de `TodaySection`.
- **Desktop menu**: se desacopló el contenido del menú hamburguesa respecto a la página de perfil con `DesktopProfileMenuContent`.
- **Footer desktop**: se añadió footer editorial con enlaces legales y layout estable en desktop.
- **Legales desktop**: se añadieron páginas semánticas para términos, privacidad y acerca de la app.
- **Contraste UI**: se corrigieron títulos y subtítulos que se perdían sobre fondo blanco en perfil, sectores favoritos y legales.
- **Imágenes**: se mejoró la carga y fallback de imágenes en cards y colecciones especiales.
- Documentación detallada: [`docs/ACTUALIZACIONES-2026-04-06.md`](docs/ACTUALIZACIONES-2026-04-06.md).

### 3) Dependencias y seguridad
- Se actualizaron dependencias transitivas vulnerables detectadas por `npm audit`.
- Estado validado: `0 vulnerabilities` tras la actualización del lockfile.
- Requisito de entorno confirmado para compilar con la versión actual de Vite: `Node 20.19+` o `22.12+`.

### 4) Detalle de evento por ruta dinámica
- Se migró de modal a página dedicada de detalle: `\/evento\/:id`.
- Nueva página `EventDetailPage` con carga de un solo documento (`getDoc`) y estados de loading/error.
- Mejoras de UI mobile-first: imagen de cabecera, panel superpuesto, bloque de información, CTA fijo y contraste optimizado de textos.

### 5) Acciones en detalle
- Botón **Abrir en Google Maps** con dirección del evento.
- Botón **Enviar por WhatsApp** con mensaje persuasivo (evento, sector, precio y URL actual), codificado con `encodeURIComponent`.
- Feedback táctil con `whileTap` en botones de acción y navegación.

### 6) Home y descubrimiento
- Se añadió sección final **“¿No sabes a dónde ir?”** con CTA **“¡Sorpréndeme! 🔥”**.
- Al hacer click, se selecciona un evento activo aleatorio y se abre su detalle.

### 7) Firestore, estructura de datos y rendimiento
- Consulta de eventos adaptada al modelo **unique / recurring**:
  - `type == 'unique'` con `endDate >= now`
  - `type == 'recurring'` con `active_until >= now`
- Filtro global de visibilidad en Home: solo eventos con `isVisible == true`.
- Orden de eventos en Home: únicos por proximidad y luego recurrentes.
- Se añadió `firestore.indexes.json` para soportar consultas con campos de visibilidad/tipo/fecha.
- Firestore configurado con `persistentLocalCache` y soporte multi-tab para cache offline consistente.

### 8) Admin completo (CRUD)
- Se creó dashboard admin con tabla paginada de eventos (`/wp-admin`).
- Acciones disponibles:
  - Crear (`/wp-admin/nuevo`)
  - Editar (`/wp-admin/editar/:eventId`)
  - Eliminar
  - Activar/Desactivar visibilidad (`isVisible`) con toggle en tiempo real (`updateDoc`).
- Indicadores visuales de estado:
  - Filas opacas si evento está inactivo
  - Eventos vencidos con estilo diferenciado y badge **Vencido**.
- Validaciones de formulario (crear/editar):
  - Título obligatorio y máximo 50 caracteres
  - Descripción máximo 250 caracteres
  - `endDate` en eventos únicos (Timestamp) y validación de fecha fin >= fecha inicio
  - Notifier inferior para mostrar errores sin perder contexto.

### 9) Navegación móvil y estados “En desarrollo”
- Se ajustó visualmente el icono de **Crear Plan** para que sea consistente con el resto.
- Para botones sin página (Explorar, Crear Plan, Perfil), se agregaron toasts de **En Desarrollo** con mensajes personalizados.
- Se añadió `AppToaster` global con estilos adaptados a modo claro/oscuro y acento esmeralda.

### 10) Librerías instaladas hoy
- **`framer-motion`**: animaciones y microinteracciones (entradas suaves y feedback táctil).
- **`sonner`**: sistema de toasts elegante y configurable por tema.

### 11) Actualizaciones 18/03/2025
- **Cloudinary**: Subida de imágenes desde admin; preset `quehayhoy_images`; fallback URL.
- **Sectores**: Kennedy, Bellavista, Malecón del Salado, Centro, Alborada.
- **Categoría**: Videojuegos 🎮
- **Popularidad**: Sistema de fueguitos (1-3); secciones Destacados (pop 3), Gratis y Bacán, No te lo puedes perder.
- **Badge conceptual**: MASIVO, FERIA, PROMO, SOCIAL con colores dinámicos.
- **Precio**: Formato $5 para enteros, $26.50 para decimales.
- Ver detalle completo en [`docs/ACTUALIZACIONES-2025-03-18.md`](docs/ACTUALIZACIONES-2025-03-18.md).

### 12) Actualizaciones recientes (notificaciones, sectores y Home)
- **Campana funcional en `Navbar`**:
  - Panel desplegable con título **“Nuevos Planes (Últimos 30m)”**.
  - Badge dinámico con conteo de no leídos.
  - Lista limitada de eventos recientes y tiempo relativo en español (**`date-fns`** + locale `es`).
- **Lógica efímera en tiempo real**:
  - Nuevo hook `useEphemeralNotifications` con `onSnapshot` a eventos recientes (`createdAt` en ventana de 30 min).
  - Estado leído/no leído:
    - Sin login: guardado en `sessionStorage`.
    - Con login (cuando se active): preparado para `usuarios/{uid}.vistos`.
- **Interacción de notificaciones**:
  - Al hacer click en una notificación se marca como vista y se abre detalle en modal sin cambiar de ruta.
  - Nuevo componente `EventDetailModal` con imagen, descripción, ubicación, precio, CTA de Maps y WhatsApp.
- **Ajustes visuales de campana y dropdown**:
  - Hover restaurado con fondo oscuro en modo dark.
  - Contraste corregido en títulos de eventos dentro del panel para que no se pierdan sobre fondos claros/oscuros.
- **Nuevo sector `La Joya`**:
  - Añadido en `SectorSelector`, en mapeos de filtros (`useEvents`) y en utilidades de admin (`eventAdminUtils`).
  - Imagen de sector actualizada y fallback visual si la URL externa falla (`SectorRoundImage`).
- **Mejoras de visibilidad en Home**:
  - Sección **Eventos Destacados** se oculta automáticamente si no hay eventos destacados (manteniendo loading/error).
  - Se añadió sección **Más eventos** para no perder eventos que no entran en los 3 bloques principales.
  - Criterio de **Gratis y Bacán** ampliado: ahora incluye precio `0`, `'0'`, vacío o `null`.

### 13) Autenticación Google, perfil y despliegue (abril 2026)

- **Google Sign-In**: validación estricta de variables Firebase; `signInWithRedirect` en móvil / pantalla estrecha; `beginGoogleRedirect()` síncrono desde el botón para Safari iOS; restauración de ruta tras OAuth (`sessionStorage`); `auth.authStateReady()` + `getRedirectResult` antes del listener; toast ante `auth/unauthorized-domain` (p. ej. IP de LAN no registrada en Firebase).
- **Dominios autorizados**: obligatorio añadir el hostname si accedes por `http://192.168.x.x:5173` (Vite con `host: true`) o por GitHub Pages.
- **UI**: `ProfileSignedInSummary` (avatar + nombre); botón **Cerrar sesión** en menú desktop.
- Documentación: [`docs/AUTENTICACION-GOOGLE-FIREBASE.md`](docs/AUTENTICACION-GOOGLE-FIREBASE.md).

### 14) Perfil, legales y sectores favoritos (28/03/2026)

- **Perfil (`/perfil`)**: diseño alineado al tema claro/oscuro del home; inicio de sesión con Google; secciones CONFIGURACIÓN y LEGAL; versión de app (**`V0.0.2`**) abajo a la izquierda (`src/lib/appVersion.js`).
- **Texto bajo el botón de Google**: copy de acceso con `text-xs` / `text-gray-400`.
- **Bottom sheets legales** (`src/components/legal/`): Términos, Política de privacidad y Acerca de; cierre con X, arrastre hacia abajo y overlay; contenido en `legalSheetContent.js` (revisión legal recomendada).
- **Sectores favoritos (`/perfil/sectores`)**: pantalla con animación desde la derecha; interruptores por sector; preferencias en **`localStorage`** (`quehayhoy-sector-visibility-v1`); lista canónica en **`src/lib/topSectors.js`**; el carrusel «Sectores Top» en home solo muestra sectores activados.
- Documentación detallada: [`docs/ACTUALIZACIONES-2026-03-28.md`](docs/ACTUALIZACIONES-2026-03-28.md).

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
- [ ] Guardar planes/favoritos (requiere login)
- [ ] Mapa interactivo
- [ ] Notificaciones Push (FCM)
- [ ] Integración completa con Firestore para categorías y tags

# QUEHAYHOY

**Descubre eventos y planes en Guayaquil** — App móvil (PWA) para recomendar planes de fin de semana basados en eventos locales.

---

## Stack

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Estado:** ThemeContext, AuthContext, SectorVisibilityContext (visibilidad de sectores en `localStorage`)
- **UX/Animaciones:** Framer Motion
- **Notificaciones:** Sonner (toasts)

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
- **Navbar:** Logo QUEHAY/HOY, buscador, campana (planes recientes), tema; acceso a perfil vía **BottomNav** (`/perfil`)
- **CategorySelector:** Bares, Conciertos, Comida, Cine, Ferias (tarjetas con iconos)
- **EventCardCarousel:** Imagen, título, badge de aforo (✨ Exclusivo, 👥 Social, 🔥 Masivo), fecha, ubicación, precio
- **FloatingButtons:** Tema (☀️/🌙), Filter, Gratis — solo móvil
- **BottomNav:** Inicio, Explorar, Favoritos (en construcción), **Perfil** → `/perfil`

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
├── contexts/       # ThemeContext, AuthContext, SectorVisibilityContext
├── hooks/          # useEvents, useEphemeralNotifications…
├── lib/            # topSectors, appVersion, utilidades compartidas
├── pages/          # App (home vía ruta /), ProfilePage, FavoriteSectorsPage, EventDetailPage…
└── ...
```

### Rutas útiles (usuario)

| Ruta | Descripción |
|------|-------------|
| `/` | Home (eventos, categorías, sectores) |
| `/perfil` | Cuenta, Google, configuración y legales |
| `/perfil/sectores` | Sectores favoritos: mostrar/ocultar en el carrusel del inicio |
| `/evento/:id` | Detalle de evento |
| `/coleccion/:id` | Página de colección especial |

---

## Actualizaciones de hoy

### 1) Detalle de evento por ruta dinámica
- Se migró de modal a página dedicada de detalle: `\/evento\/:id`.
- Nueva página `EventDetailPage` con carga de un solo documento (`getDoc`) y estados de loading/error.
- Mejoras de UI mobile-first: imagen de cabecera, panel superpuesto, bloque de información, CTA fijo y contraste optimizado de textos.

### 2) Acciones en detalle
- Botón **Abrir en Google Maps** con dirección del evento.
- Botón **Enviar por WhatsApp** con mensaje persuasivo (evento, sector, precio y URL actual), codificado con `encodeURIComponent`.
- Feedback táctil con `whileTap` en botones de acción y navegación.

### 3) Home y descubrimiento
- Se añadió sección final **“¿No sabes a dónde ir?”** con CTA **“¡Sorpréndeme! 🔥”**.
- Al hacer click, se selecciona un evento activo aleatorio y se abre su detalle.

### 4) Firestore, estructura de datos y rendimiento
- Consulta de eventos adaptada al modelo **unique / recurring**:
  - `type == 'unique'` con `endDate >= now`
  - `type == 'recurring'` con `active_until >= now`
- Filtro global de visibilidad en Home: solo eventos con `isVisible == true`.
- Orden de eventos en Home: únicos por proximidad y luego recurrentes.
- Se añadió `firestore.indexes.json` para soportar consultas con campos de visibilidad/tipo/fecha.
- Firestore configurado con `persistentLocalCache` y soporte multi-tab para cache offline consistente.

### 5) Admin completo (CRUD)
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

### 6) Navegación móvil y estados “En desarrollo”
- Se ajustó visualmente el icono de **Crear Plan** para que sea consistente con el resto.
- Para botones sin página (Explorar, Crear Plan, Perfil), se agregaron toasts de **En Desarrollo** con mensajes personalizados.
- Se añadió `AppToaster` global con estilos adaptados a modo claro/oscuro y acento esmeralda.

### 7) Librerías instaladas hoy
- **`framer-motion`**: animaciones y microinteracciones (entradas suaves y feedback táctil).
- **`sonner`**: sistema de toasts elegante y configurable por tema.

### 8) Actualizaciones 18/03/2025
- **Cloudinary**: Subida de imágenes desde admin; preset `quehayhoy_images`; fallback URL.
- **Sectores**: Kennedy, Bellavista, Malecón del Salado, Centro, Alborada.
- **Categoría**: Videojuegos 🎮
- **Popularidad**: Sistema de fueguitos (1-3); secciones Destacados (pop 3), Gratis y Bacán, No te lo puedes perder.
- **Badge conceptual**: MASIVO, FERIA, PROMO, SOCIAL con colores dinámicos.
- **Precio**: Formato $5 para enteros, $26.50 para decimales.
- Ver detalle completo en [`docs/ACTUALIZACIONES-2025-03-18.md`](docs/ACTUALIZACIONES-2025-03-18.md).

### 9) Actualizaciones recientes (notificaciones, sectores y Home)
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

### 10) Perfil, legales y sectores favoritos (28/03/2026)

- **Perfil (`/perfil`)**: diseño alineado al tema claro/oscuro del home; inicio de sesión con Google; secciones CONFIGURACIÓN y LEGAL; versión de app (**`V0.0.2`**) abajo a la izquierda (`src/lib/appVersion.js`).
- **Texto bajo el botón de Google**: copy de acceso con `text-xs` / `text-gray-400`.
- **Bottom sheets legales** (`src/components/legal/`): Términos, Política de privacidad y Acerca de; cierre con X, arrastre hacia abajo y overlay; contenido en `legalSheetContent.js` (revisión legal recomendada).
- **Sectores favoritos (`/perfil/sectores`)**: pantalla con animación desde la derecha; interruptores por sector; preferencias en **`localStorage`** (`quehayhoy-sector-visibility-v1`); lista canónica en **`src/lib/topSectors.js`**; el carrusel «Sectores Top» en home solo muestra sectores activados.
- Documentación detallada: [`docs/ACTUALIZACIONES-2026-03-28.md`](docs/ACTUALIZACIONES-2026-03-28.md).

---

## Próximos pasos sugeridos

- [ ] Autenticación con Apple
- [ ] Guardar planes/favoritos (requiere login)
- [ ] Mapa interactivo
- [ ] Notificaciones Push (FCM)
- [ ] Integración completa con Firestore para categorías y tags

# Actualizaciones del 12 de abril de 2026

Documentación de: (1) **cabecera unificada** en favoritos y categorías; (2) pantalla **Explorar** con mapa Google, búsqueda flotante, chips y mini-card de evento.

---

## 1. Objetivo

- Homogeneizar la **barra superior** (volver, título compacto al hacer scroll, título grande en el contenido) entre:
  - Sectores favoritos (referencia ya existente)
  - Categorías favoritas
  - Favoritos (lista de eventos guardados)

---

## 2. Categorías favoritas (`FavoriteCategoriesPage.jsx`)

### Antes
- Cabecera con `border-b`, título inline junto al botón atrás (`flex` + `h1`), sin título compacto al scroll.
- Descripción en bloque fijo debajo del header, fuera del área con scroll principal.

### Después (alineado con `FavoriteSectorsPage.jsx`)
- **Header flotante** `absolute inset-x-0 top-0 z-10` con fondo semitransparente (`bg-white/95` o `bg-[#121212]/95`) y `safe-area` superior.
- **Rejilla** de tres columnas: `44px` (atrás) | título compacto centrado | hueco simétrico `44px`.
- Botón atrás: `h-10 w-11`, mismas clases de hover/active que sectores.
- **Título compacto** (`text-sm`, centrado): visible cuando el título hero sale de la zona del header, con transición `opacity` + `translate-y`.
- **Área con scroll** (`flex-1 min-h-0 overflow-y-auto`) con `onScroll` que llama a la misma lógica de umbral que sectores (`COMPACT_TITLE_TOUCH_OFFSET = 10`).
- **Hero** dentro del scroll: `h2` `text-2xl` + párrafo con `mt-2 text-sm leading-5` y grises `!text-gray-400` / `!text-gray-500` según tema.
- **Refs**: `compactHeaderRef`, `heroTitleRef`; **estado**: `showCompactTitle`.
- **Resize**: listener en `window` para recalcular el título compacto.

### Sin cambiar
- Lista de categorías con iconos, switches y `border-b` entre filas.

---

## 3. Favoritos — eventos (`FavoriteEventsPage.jsx`, ruta `/favoritos`)

### Antes
- Cabecera dentro del `main`, con `border-b`, título `text-xl` y descripción en la misma fila visual que el botón atrás.

### Después (mismo estilo de cabecera, adaptado a página con scroll global)
- **Header fijo** `fixed inset-x-0 top-0 z-40` (por encima del contenido; la barra inferior sigue en `z-50` en `BottomNav.jsx`).
- Misma **rejilla** y **título compacto** “Favoritos” que en las otras pantallas.
- **`updateCompactTitle`** encapsulado en `useCallback` para listeners estables.
- **Scroll**: `window` `scroll` (passive) + `resize`; un `useEffect` adicional recalcula al cambiar `loading`, `error`, `favoriteIds.length` o `favoriteEvents.length` (por si cambia la altura del layout sin mover el scroll).
- **Hero**: fila con `h2` `text-2xl` + icono `Heart` (`h-6 w-6`, color acento); subtítulo con el mismo criterio de grises que categorías/sectores.
- **`main`**: `pt-[calc(env(safe-area-inset-top)+3.75rem)]` (y un poco más en `md`) para no solapar el header fijo; se mantiene `pb-24` para la navegación inferior en móvil.

### Sin cambiar
- Lógica de favoritos (`useFavoriteEvents`), carga de eventos (`useEvents`), estados vacío/error/carga, grid de `EventCard`, `Footer` y `BottomNav`.

---

## 4. Referencia de implementación

Patrón de referencia compartido (sectores): `src/pages/FavoriteSectorsPage.jsx` — header `absolute` sobre contenedor a pantalla completa con scroll **interno**; en **Favoritos** el scroll es el del **documento**, por eso el header es `fixed` y los listeners van a `window`.

---

## 5. Archivos tocados

| Archivo | Cambio resumido |
|---------|------------------|
| `src/pages/FavoriteCategoriesPage.jsx` | Header + scroll + hero como sectores |
| `src/pages/FavoriteEventsPage.jsx` | Header fijo + compact title + hero; listeners `window` |

En este bloque de cabeceras no se añadieron rutas nuevas; la ruta `/explorar` figura en las secciones 6 y 7.

---

## 6. Pantalla Explorar (`/explorar`)

### Objetivo
- Vista **mapa a pantalla completa** (`100dvh`) para descubrir eventos en Guayaquil.
- **Google Maps JavaScript API** vía `@react-google-maps/api` (`useJsApiLoader`, `GoogleMap`, `Marker`).
- **Header flotante**: búsqueda + carrusel horizontal de categorías (mismos chips que el home: `CATEGORIES` + `useCategoryVisibility`).
- **Marcadores**: icono generado en canvas (PNG data URL) con el **emoji de la categoría** (ej. 🍺 bares); si no aplica categoría conocida, icono **🔥** como marca por defecto.
- **Mini-card** inferior al pulsar un pin: imagen, título, fecha · sector, **Ver más** (`getEventDetailPath`) y **Cerrar**; animación con Framer Motion.

### Configuración
- Variable de entorno **`VITE_GOOGLE_MAPS_API_KEY`** (documentada en `.env.example`).
- Sin clave: mensaje en pantalla y enlace “Volver al inicio”; no se carga el script de Google.
- En Google Cloud: activar **Maps JavaScript API** y restringir la clave por referrer cuando corresponda.

### Posicionamiento de pins (`src/lib/exploreGeo.js`)
- Si el documento en Firestore incluye **`latitude` / `longitude`** (también se aceptan alias `lat` / `lng` leídos en `useEvents.js`), se usan tal cual.
- Si no: **ancla por nombre de sector** (`SECTOR_ANCHOR_BY_LABEL`, alineado con etiquetas de `location`/`sector` en Firestore) + **jitter determinista** por `id` para separar eventos en el mismo sector.

### Filtros (`src/lib/exploreFilters.js`)
- **`filterExploreEvents`**: categoría activa (chip) + texto con **`filterEventsByHomeSearch`** (mismo criterio que el buscador del home).
- En la página se combina antes con **`filterEventsByCategoryVisibility`** para respetar categorías ocultas en ajustes de usuario.

### Mapa (`src/components/explore/ExploreMapView.jsx`)
- Idioma **`es`**, región **`EC`**.
- **`fitBounds`** con padding superior pensado para el header flotante; sin eventos: centro en **Guayaquil** y zoom por defecto.
- Tema oscuro: estilos simplificados (`MAP_STYLES_DARK`).
- Clic en el mapa vacío cierra la selección; clic en marcador abre la mini-card (estado por `selectedEventId` derivado con `useMemo`).

### Navegación
- **`BottomNav`**: pestaña Explorar → `navigate('/explorar')` (eliminado toast “pronto”).
- **`DesktopProfileMenuContent`**: fila “Explorar” → `navigate('/explorar')` (eliminado toast y dependencia de `sonner` en ese flujo).
- **`main.jsx`**: ruta `<Route path="/explorar" element={<ExplorePage />} />`.

### Dependencia npm
- **`@react-google-maps/api`**: carga del loader oficial (`@googlemaps/js-api-loader` transitivo).

---

## 7. Archivos adicionales (Explorar)

| Archivo / carpeta | Rol |
|-------------------|-----|
| `src/pages/ExplorePage.jsx` | Orquestación: clave API, filtros, estado de selección, `BottomNav` |
| `src/components/explore/ExploreFloatingHeader.jsx` | Barra búsqueda + chips (`backdrop-blur-[10px]`) |
| `src/components/explore/ExploreMapView.jsx` | Mapa, marcadores, bounds |
| `src/components/explore/ExploreEventMiniCard.jsx` | Sheet inferior con CTA al detalle |
| `src/lib/exploreGeo.js` | Coordenadas y anclas por sector |
| `src/lib/exploreFilters.js` | Filtro categoría + búsqueda |
| `src/lib/mapMarkerIcon.js` | Data URLs de iconos emoji |
| `src/hooks/useEvents.js` | Campos opcionales `latitude` / `longitude` en el objeto evento |
| `.env.example` | Entrada `VITE_GOOGLE_MAPS_API_KEY` |
| `package.json` / `package-lock.json` | Dependencia `@react-google-maps/api` |

---

## 8. Admin: coordenadas reales en el mapa

- **`eventAdminUtils.js`**: `initialForm` incluye `latitude` y `longitude` (strings en el formulario); `mapFirestoreDocToForm` lee `latitude`/`longitude` o `lat`/`lng`; `buildEventPayload` persiste números válidos o `null` si faltan o son inválidos.
- **`AdminEventForm.jsx`**: bloque “Ubicación en el mapa” con inputs de lat/lng, validación (ambas o ninguna) y botón **Obtener coordenadas desde dirección** (dirección + sector + Guayaquil, Ecuador).
- **`src/lib/geocodeFromAddress.js`**: carga el script con `@googlemaps/js-api-loader` y usa `google.maps.Geocoder` (requiere **Geocoding API** habilitada y la misma `VITE_GOOGLE_MAPS_API_KEY`).
- **`.env.example`**: nota sobre Geocoding API.

---

## 9. Explorar: segunda fila de filtros (Gratis + tiempo + “+ Filtros”)

### Objetivo
- Debajo de los chips de **categoría**, barra con **dos niveles**: toggle **Gratis** independiente y **un solo chip de tiempo** (radio) entre Hoy / Mañana / Fin de semana / Mes.
- Estilo **más fino** que las categorías (`text-xs`, menos padding), **`backdrop-blur-[8px]`** y fondo semitransparente.
- **Separador** vertical sutil entre el botón Gratis y el carrusel horizontal (scroll).
- Botón **+ Filtros** con icono **Sliders** (`lucide-react`): `onOpenMoreFilters` preparado para un modal futuro (por ahora no-op desde `ExplorePage`).

### Archivos
- **`src/components/explore/ExploreSecondaryFiltersBar.jsx`**: UI de la barra; `role="radiogroup"` en los chips de tiempo.
- **`src/lib/exploreTimeFilters.js`**: `isEventGratis`, `eventMatchesTimePreset`, `filterEventsByExploreSecondary`, lista `EXPLORE_TIME_CHIPS`.
- **`ExploreFloatingHeader.jsx`**: recibe props y renderiza la barra secundaria.
- **`ExplorePage.jsx`**: estado `isFreeFilter`, `timePreset` (por defecto **`'today'`** para mostrar **eventos de hoy** al entrar), y encadena `filterEventsByExploreSecondary` tras categoría + búsqueda.

### Lógica de tiempo (resumen)
- **Únicos**: solape del intervalo del evento (`dateMs` / `endDateMs`) con el día o rango elegido (medianoche **local** del navegador).
- **Recurrentes**: **Hoy** / **Mañana** comparan `recurrence_day` con el día de la semana (`0` = domingo, alineado con `Date.getDay()`); **Fin de semana** si `recurrence_day` es 0 o 6; **Mes**: únicos en el mes calendario local, recurrentes incluidos (regla simple).

---

## 10. Mapa Explorar: UX visual y marcadores

- **`ExploreMapView.jsx`**: en **modo claro**, estilos `MAP_STYLES_LIGHT` ocultan **POI** y **transit** para reducir ruido (similar a la sensación del mapa oscuro).
- **`ExploreFloatingHeader.jsx`**: input de búsqueda a **`text-[16px]`** para evitar el **zoom automático de iOS Safari** al enfocar (y que no “salte” el `BottomNav`).
- **`mapMarkerIcon.js`**: marcadores **circulares** con emoji centrado; ancla y tamaño escalado alineados con el `Marker` de Google (`MARKER_MAP_*`); caché por versión para invalidar PNG antiguos.

---

## 11. Tabla rápida (fase Explorar reciente)

| Archivo | Cambio |
|---------|--------|
| `ExploreSecondaryFiltersBar.jsx` | Nueva barra secundaria |
| `exploreTimeFilters.js` | Filtros gratis + tiempo |
| `ExplorePage.jsx` | Estado y filtro; `timePreset` inicial `'today'` |
| `ExploreFloatingHeader.jsx` | Props y tercera fila |
| `ExploreMapView.jsx` | Estilos mapa claro sin POI |
| `mapMarkerIcon.js` | Pin circular + caché |

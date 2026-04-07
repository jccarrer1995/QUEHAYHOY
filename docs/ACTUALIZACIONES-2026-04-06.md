# Actualizaciones del 6 de abril de 2026

Documentación de los cambios realizados en la sesión del día: contraste en perfil/legal, slugs amigables, filtros del home, menú desktop, páginas legales, footer desktop y ajustes visuales de colecciones.

---

## 1. Perfil, legales y contraste visual

### Perfil (`ProfilePage.jsx`)
- Se corrigió el contraste de los encabezados `Configuración` y `Legal` en tema claro usando clases con `!` para vencer la regla global de `h2` en `index.css`.
- Se corrigió el contraste de la fila `Sectores Favoritos` y de los textos internos del perfil en modo claro.

### `FavoriteSectorsPage.jsx`
- Se corrigió el contraste del título `Sectores favoritos`, el texto descriptivo y los labels de sectores en modo claro.
- El problema venía del estilo global de `h1/h2` (`color: var(--text-h)`) fuera de `@layer`.

### Legales
- `LegalBottomSheet.jsx`: se ajustaron colores del título principal, subtítulos internos y botón cerrar para que no se pierdan sobre fondo blanco.
- `LegalPage.jsx`: se forzó el color de los subtítulos (`I. ACEPTACIÓN`, etc.) con `!text-*` para que no los pise el `h2` global.

---

## 2. Friendly URLs / slugs para eventos

### Nueva utilidad
- Se creó `src/lib/slug.js` con:
  - `generateSlug(text)`
  - `generateShortUniqueSuffix()`
  - `categoryIdToSlugSegment()`
  - `buildEventSlugPath()`
  - `ensureUniqueEventSlug()`
  - `getEventDetailPath()`
  - `buildPublicEventUrl()`

### Admin
- `AdminEventForm.jsx`: al crear o editar eventos se genera y guarda `slug`.
- `eventAdminUtils.js`: `buildEventPayload()` ahora acepta `slug`.

### Rutas
- Se añadió la ruta pública nueva:
  - `/evento/:categoria/:slug`
- Se mantuvo compatibilidad legacy:
  - `/evento/:id`

### Detalle
- `EventDetailPage.jsx` ahora puede:
  - buscar por `slug` compuesto (`categoria/slug`)
  - seguir abriendo por ID si el evento es antiguo

### Navegación
- Se actualizaron rutas en:
  - `App.jsx`
  - `EventCard.jsx`
  - `EventCardCarousel.jsx`
  - `EventDetailModal.jsx`
- Los enlaces públicos y de compartir ya usan la estructura amigable cuando existe `slug`.

---

## 3. Filtros del home y sectores favoritos

### Sectores favoritos -> ocultar eventos
- Se añadió lógica para que un sector desactivado en `Sectores Favoritos` no solo oculte el chip, sino también sus eventos.
- `src/lib/topSectors.js` ahora contiene:
  - `topSectorIdFromEventLabel()`
  - `filterEventsBySectorVisibility()`
  - `eventMatchesSectorChip()`

### Home
- `App.jsx`: los eventos del home se filtran por:
  - visibilidad de sectores favoritos
  - sector top activo
  - buscador

### `Pilas Hoy`
- `TodaySection.jsx` se refactorizó para:
  - separar eventos crudos desde Firestore (`rawTodayEvents`)
  - recalcular la lista visible con `useMemo`
  - responder al sector top activo
  - responder al buscador del home
  - responder a sectores favoritos ocultos

### Colecciones
- `CollectionPage.jsx` también respeta la visibilidad de sectores favoritos.

### Nueva utilidad de búsqueda
- Se creó `src/lib/homeSearchFilter.js` con `filterEventsByHomeSearch()` para compartir la lógica del buscador entre Home y `Pilas Hoy`.

---

## 4. Menú desktop y desacople con perfil

### Separación de componentes
- `ProfileMenuContent.jsx` quedó exclusivo para la página `/perfil`.
- Se creó `DesktopProfileMenuContent.jsx` para el drawer desktop del menú hamburguesa.
- `Navbar.jsx` ahora usa `DesktopProfileMenuContent`, no reutiliza el componente de la página de perfil.

### Menú desktop
- Se añadió:
  - `Explorar`
  - `Favoritos`
  - `Sectores Favoritos`
- Se eliminó del menú desktop el bloque `Legal`.
- La versión de app se movió al fondo real del panel.
- Se quitó la flecha derecha (`ChevronRight`) de las filas del menú.

### Interacciones
- Se añadió `cursor-pointer` a las opciones del menú desktop.
- Se añadió animación suave de hover:
  - cambio de fondo
  - leve `scale` del icono
- Se eliminó la traslación horizontal del hover para evitar scrollbar inferior.

---

## 5. Carga de imágenes y consistencia en cards

### Problema investigado
- En `Colecciones Especiales`, algunas imágenes sí existían pero a veces no se veían.
- Causa:
  - `EventCard` podía dejar la imagen en `opacity: 0` cuando venía cacheada
  - `optimizeImageUrl()` estaba agregando parámetros a cualquier host

### Correcciones
- `EventCard.jsx`:
  - soporte robusto a `imageUrl` e `image_url`
  - detección de imágenes ya cargadas con `ref + img.complete`
  - fallback visual cuando la imagen falla
- `EventCardCarousel.jsx`:
  - fallback consistente cuando una imagen falla
- `src/lib/index.js`:
  - `optimizeImageUrl()` ahora solo modifica hosts conocidos

---

## 6. Colecciones especiales: cabecera y compartir

### Header visual
- `CollectionPage.jsx` recibió varios ajustes:
  - menos aire arriba en el hero
  - título más compacto
  - descripción centrada
  - gradiente de fondo más fuerte para mejorar contraste

### Header compacto con blur
- Se añadió un header sticky/compacto estilo glassmorphism que aparece al hacer scroll:
  - botón atrás
  - título centrado
  - fondo con blur

### Compartir
- Se añadió botón de compartir por WhatsApp tanto en:
  - hero principal
  - header compacto

### Layout tipo Uber Eats
- El bloque de texto del hero quedó centrado visualmente, independiente de los iconos laterales.

### Footer pegado abajo
- Se ajustó `CollectionPage.jsx` para que el footer quede pegado al borde inferior en desktop (`lg:pb-0`).

---

## 7. Footer desktop y páginas legales

### Footer
- Se creó `src/components/layout/Footer.jsx`.
- Solo visible en desktop (`lg:block`).
- Evolucionó de una fila simple de links a un footer más editorial:
  - bloque superior con tres columnas informativas:
    - `¿Qué es QUEHAYH🔥Y?`
    - `Sé parte del mapa`
    - `Contacto y Soporte`
  - separador
  - franja inferior con logo, copyright y links legales

### Rutas legales
- Se creó `src/lib/legalLinks.js`.
- Se añadieron rutas:
  - `/legal/terminos-y-condiciones`
  - `/legal/politica-de-privacidad`
  - `/legal/acerca-de-la-app`

### Página legal
- Se creó `src/pages/LegalPage.jsx`.
- Reutiliza el contenido de `getLegalSheetBody()` para asegurar consistencia con los modales móviles.

### Integración
- El footer se integró en:
  - `App.jsx`
  - `CollectionPage.jsx`
  - `LegalPage.jsx`

### Ajustes posteriores
- Se corrigió overflow horizontal del footer.
- Se reorganizó la franja inferior para alinear mejor:
  - logo
  - copyright
  - links legales

---

## 8. UX de cursores en desktop

### Botones interactivos
- Se añadió `cursor-pointer` a:
  - botón `¡Sorpréndeme!`
  - flechas activas de `SpecialCollections`
  - flechas activas de `TodaySection`
  - flechas activas de `HorizontalEventRow`

### Estados no interactivos
- Se mantuvo `cursor-not-allowed` en controles deshabilitados.

---

## 9. Archivos relevantes tocados hoy

| Área | Archivos principales |
|------|----------------------|
| Perfil / menú | `src/components/layout/ProfileMenuContent.jsx`, `src/components/layout/DesktopProfileMenuContent.jsx`, `src/pages/ProfilePage.jsx`, `src/components/layout/Navbar.jsx` |
| Legales | `src/components/legal/LegalBottomSheet.jsx`, `src/components/legal/legalSheetContent.js`, `src/pages/LegalPage.jsx`, `src/lib/legalLinks.js`, `src/main.jsx` |
| Footer | `src/components/layout/Footer.jsx`, `src/components/layout/index.js`, `src/App.jsx`, `src/pages/CollectionPage.jsx` |
| Slugs | `src/lib/slug.js`, `src/pages/AdminEventForm.jsx`, `src/pages/admin/eventAdminUtils.js`, `src/pages/EventDetailPage.jsx`, `src/main.jsx` |
| Filtros | `src/lib/topSectors.js`, `src/lib/homeSearchFilter.js`, `src/App.jsx`, `src/components/events/TodaySection.jsx`, `src/pages/CollectionPage.jsx` |
| Cards / imágenes | `src/components/events/EventCard.jsx`, `src/components/events/EventCardCarousel.jsx`, `src/lib/index.js` |
| Colecciones | `src/pages/CollectionPage.jsx`, `src/components/events/SpecialCollections.jsx` |

---

## 10. Notas

- El estilo global de `h1/h2` en `src/index.css` sigue siendo un punto sensible; varios fixes de contraste se resolvieron con clases Tailwind forzadas (`!text-*`).
- Los eventos antiguos siguen soportados por ID, pero los nuevos ya usan rutas amigables por slug.
- El menú desktop y la página de perfil ya están desacoplados para permitir evolución independiente.

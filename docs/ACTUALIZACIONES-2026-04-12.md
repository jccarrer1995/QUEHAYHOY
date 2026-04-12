# Actualizaciones del 12 de abril de 2026

Documentación de los ajustes de **cabecera unificada** en pantallas de favoritos y categorías: mismo patrón visual y de comportamiento que **Sectores favoritos** (`FavoriteSectorsPage.jsx`).

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

No se modificaron rutas ni contextos en estos ajustes.

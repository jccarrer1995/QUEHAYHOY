# Actualizaciones del 18 de marzo de 2025

Documentación de todos los cambios realizados en la sesión del día.

---

## 1. Subida de imágenes con Cloudinary

### AdminEventForm
- **Input de archivo**: Reemplazo del input `type="url"` por `<input type="file" accept="image/*" />`.
- **Función `uploadImage`**: Subida a la API de Cloudinary mediante `fetch` al endpoint `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload` con `FormData` (`file` + `upload_preset`).
- **Upload preset**: Configurado como `quehayhoy_images` (debe crearse en Cloudinary Dashboard como Unsigned).
- **Variables de entorno**: `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` en `.env`.
- **Fallback**: Campo para pegar URL de imagen manual si la subida falla.
- **UX**: Mensaje "Subiendo imagen…" mientras la API responde; vista previa al completar.

---

## 2. Sectores Top

### Nuevos sectores añadidos
- **Kennedy** (reemplaza "Av. Las Américas")
- **Bellavista**
- **Malecón del Salado**
- **Centro**
- **Alborada** (con imagen actualizada)

### Archivos modificados
- `SectorSelector.jsx`: Lista de sectores con imágenes.
- `useEvents.js`: Mapeo `SECTOR_TO_FIRESTORE`.
- `eventAdminUtils.js`: Mapeo para formulario admin.

---

## 3. Categorías

### Nueva categoría
- **Videojuegos** 🎮

### Archivos
- `CategorySelector.jsx`
- `CategoryFilter.jsx`

---

## 4. Sistema de popularidad (fueguitos 🔥)

### Admin
- Campo **Popularidad** en el formulario: selector con 3 opciones (🔥, 🔥🔥, 🔥🔥🔥).
- Valor por defecto en Firestore: `1` si está vacío.

### Cards (EventCard, EventCardCarousel)
- Badge de fueguitos: `Math.min(Math.max(popularidad || 1, 1), 3)`.
- Estilo: `flex gap-1 text-orange-500 font-bold`.

### Secciones en Home (App.jsx)
- **Eventos Destacados**: Solo eventos con `popularidad === 3`.
- **Gratis y Bacán** ✨: Eventos con `price === 0` o `price === '0'`.
- **No te lo puedes perder** 📍: Eventos con `popularidad` 1 o 2 Y `price > 0`; ordenados con popularidad 2 primero.

---

## 5. Formato de precio

### Reglas
- **Enteros** (ej. 5): Se muestra `$5` (sin decimales).
- **Con decimales** (ej. 26.50): Se muestra `$26.50` (2 decimales).

### Archivos
- `EventCard.jsx`
- `EventCardCarousel.jsx`
- `EventDetailPage.jsx` (`formatPriceValue`)

---

## 6. Badge conceptual (reemplazo de nivel de aforo)

### Admin
- Sustitución del selector "Nivel de aforo" por **Badge conceptual**.
- Nuevas opciones: **MASIVO**, **FERIA**, **PROMO**, **SOCIAL**.
- Valor guardado en Firestore en el campo `badgeLabel`.

### Cards
- Badge muestra el texto de `badgeLabel` (o `capacity_level` como fallback).
- Colores:
  - **MASIVO**: Cian/Turquesa
  - **FERIA**: Amarillo
  - **PROMO**: Rojo
  - **SOCIAL**: Morado/Magenta
- Posición: esquina superior derecha, texto en mayúsculas, fondo translúcido y borde.

### Compatibilidad
- Eventos antiguos con `capacity_level` se mapean al editar (`firestoreBadgeToFormId`).

---

## 7. Otras mejoras

### AdminEventForm
- Descripción: límite aumentado a **500 caracteres** (antes 250).
- Título "Publicar evento" / "Editar evento": estilo inline para contraste correcto.
- Botón para cambiar tema (☀️/🌙) en el header.

### useEvents
- Conversión de Timestamp de Firestore a string para evitar error "Objects are not valid as a React child".

---

## Archivos modificados (resumen)

| Archivo | Cambios principales |
|---------|---------------------|
| `AdminEventForm.jsx` | Cloudinary, popularidad, badgeLabel, descripción 500, tema |
| `eventAdminUtils.js` | BADGE_LABELS, badgeLabel, popularidad en payload |
| `useEvents.js` | popularidad, badgeLabel, formatDateForDisplay |
| `EventCard.jsx` | Badge conceptual, fueguitos, formato precio |
| `EventCardCarousel.jsx` | Badge conceptual, fueguitos, formato precio |
| `EventDetailPage.jsx` | formatPriceValue con 2 decimales |
| `App.jsx` | Secciones Destacados, Gratis, No te lo puedes perder |
| `CategorySelector.jsx` | Videojuegos |
| `CategoryFilter.jsx` | Videojuegos |
| `SectorSelector.jsx` | Kennedy, Bellavista, Malecón, Centro, Alborada |
| `.env.example` | Variables Cloudinary |

---

## Despliegue

- Comando: `npm run deploy`
- Plataforma: GitHub Pages
- URL: `https://jccarrer1995.github.io/QUEHAYHOY/`

---

## 8. Actualizaciones recientes (Home + Colecciones)

### Navbar responsive
- Se priorizó buscador en móvil (header compacto): logo oculto en mobile y campana a la derecha del input.
- Placeholder móvil ajustado a la marca: `QUEHAYHOY en GYE?`.

### Separadores y espaciado entre secciones
- Se añadieron líneas separadoras por sección en Home (solo se renderizan cuando existe la sección).
- Se redujo espaciado vertical en mobile (`mt/pt`) para una lectura más compacta.
- Se quitó la línea separadora de `¿No sabes a dónde ir?`.

### Sección `¡Pilas Hoy!`
- Nuevo componente `TodaySection` con título animado (`shine` + `soft-blink`).
- Incluye estados: loading, error y empty state amigable.
- Lógica de datos en tiempo real:
  - eventos únicos de hoy (por rango de fecha),
  - eventos recurrentes del día actual (`recurrence_day`),
  - con `active_until` vigente.
- Fallback para evitar bloqueo por índices compuestos en construcción:
  - consulta básica `isVisible == true`,
  - filtro de “hoy” y “recurrente hoy” en cliente.
- Desktop también usa carrusel horizontal con botones de navegación.

### Sistema nuevo de badges de eventos
- Reemplazo de lógica anterior por `badgeType` unificado.
- Nuevo módulo compartido: `src/lib/eventBadges.js`.
- Nuevo componente visual: `src/components/events/EventBadge.jsx`.
- `EventCard` y `EventCardCarousel` usan el mismo badge.
- Estilo actual:
  - texto blanco,
  - fondo por tipo (SOLO_HOY, MASIVO, RECOMENDADO, PET_FRIENDLY, PROMO, GRATIS),
  - esquina inferior izquierda sin curva (`rounded-bl-none`).
- Migración de compatibilidad:
  - soporte temporal para `badgeLabel/capacity_level` antiguos.
- Admin actualizado:
  - select de badge guarda `badgeType`,
  - en update se limpia `badgeLabel` legado con `deleteField()`.

### Colecciones Especiales
- Nueva sección `SpecialCollections` con cards cuadradas `PromoSquare` (1:1).
- Datos hardcoded de feriados/fechas en `src/lib/specialCollections.js`.
- Regla de vigencia:
  - si la fecha actual supera la fecha de colección (mes/día), no se muestra.
- Desktop:
  - botones izquierda/derecha para desplazar,
  - ocultación automática si no hay desplazamiento disponible,
  - avance por clic aumentado (salto mayor, no 1 a 1).

### Ruta dinámica de colección
- Nueva ruta: `/coleccion/:id`.
- Nueva página: `CollectionPage.jsx` con:
  - hero visual (imagen oscurecida + difuminada),
  - título en blanco forzado para contraste,
  - botón de volver igual al de detalle de evento,
  - grilla de `EventCard` filtrada por fecha de colección.
- Estado vacío:
  - `Estamos preparando los mejores planes para este feriado. ¡Vuelve pronto! ⏳`

### Carruseles horizontales en desktop
- Secciones `Eventos Destacados`, `Gratis y Bacán`, `No te lo puedes perder` y `Más eventos` usan carrusel horizontal también en desktop.
- Controles de navegación con estado bloqueado cuando no se puede desplazar.
- Ajustes para mantener tamaño fijo de cards (sin estirarlas en desktop).

---

## Archivos nuevos (recientes)

- `src/components/events/TodaySection.jsx`
- `src/components/events/PromoSquare.jsx`
- `src/components/events/SpecialCollections.jsx`
- `src/components/events/HorizontalEventRow.jsx`
- `src/components/events/EventBadge.jsx`
- `src/pages/CollectionPage.jsx`
- `src/lib/eventBadges.js`
- `src/lib/specialCollections.js`

---

## 9. Ajustes finales de UX/Navegación (última iteración)

### Colecciones Especiales
- Click de card navega a ruta dinámica: `/coleccion/:id`.
- En `CollectionPage` el filtrado quedó **solo por fecha de colección** (día/mes), sin keywords.
- Regla de visibilidad en Home:
  - si la fecha actual ya superó la fecha de la colección, esa colección se oculta.
- Botones de desplazamiento en desktop:
  - avance por clic aumentado (salto mayor, no 1 a 1),
  - ocultación automática cuando no hay desplazamiento disponible.

### CollectionPage
- Hero de cabecera mejorado para contraste:
  - imagen más oscura y ligeramente difuminada,
  - título y descripción forzados en blanco.
- Botón “volver” igualado al estilo del detalle de evento (botón circular con ícono).
- Estado “Próximamente” activo cuando no hay eventos para esa fecha.

### Secciones Home en desktop
- `Eventos Destacados`, `Gratis y Bacán`, `No te lo puedes perder` y `Más eventos` migradas a carrusel horizontal.
- Controles izquierda/derecha con estado bloqueado (`disabled`) cuando corresponde.
- Se mantuvo el tamaño fijo visual de cards para evitar estiramiento en desktop.

### ¡Pilas Hoy!
- Incluye eventos:
  - únicos del día actual,
  - recurrentes cuyo `recurrence_day` coincide con hoy.
- Se aplicó fallback de consulta (`isVisible == true`) + filtro en cliente para evitar bloqueo por índices compuestos en construcción.

### Navbar y navegación móvil
- Botón de cambio de tema visible junto a la campana también en móvil.
- En bottom nav:
  - `Crear Plan` fue renombrado a `Favoritos`.
  - mensaje temporal del tab actualizado a favoritos.
- Se eliminó el botón flotante fijo de cambio claro/oscuro (`FloatingButtons`) del Home.

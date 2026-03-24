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

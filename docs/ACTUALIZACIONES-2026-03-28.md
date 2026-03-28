# Actualizaciones del 28 de marzo de 2026

Documentación de los cambios realizados en la sesión del día: perfil, legales, sectores favoritos y ajustes de UI.

---

## 1. Página de perfil (`ProfilePage.jsx`)

### Diseño
- Pantalla a alto completo alineada al tema del home (`ThemeContext`): fondo `#121212` / texto `#E0E0E0` en oscuro; blanco / `gray-900` en claro.
- Padding lateral **20px** (`px-[20px]`).

### Acceso e inicio de sesión
- Texto introductorio bajo el botón de Google: *«Inicia sesión para disfrutar la experiencia completa»* con **`text-xs`**, **`text-gray-400`**, **`mt-2`** y centrado.
- Botón **Continuar con Google** (`rounded-full`, blanco, logo G multicolor en SVG) enlazado a **`signInWithGoogle`** (`AuthContext`).
- Si hay usuario, se muestra saludo con nombre o correo.

### Secciones
- **CONFIGURACIÓN**: fila «Sectores Favoritos» (navega a `/perfil/sectores`).
- **LEGAL**: Términos, Privacidad, Acerca de (abren bottom sheet).

### Versión
- **`V0.0.2`** fija abajo a la izquierda, tipografía fina (`font-extralight`), respetando safe area y bottom nav.
- Constante central: `src/lib/appVersion.js` (reexportada en `src/lib/index.js`).

### Rutas y navegación
- **`/perfil`**: `ProfilePage`.
- **`BottomNav`**: pestaña Perfil → `/perfil`; Inicio → `/`.

---

## 2. Modales legales (bottom sheet)

### Componentes
- **`LegalBottomSheet`** (`src/components/legal/LegalBottomSheet.jsx`): portal, animación desde abajo (Framer Motion), overlay, cierre con X, arrastre hacia abajo (manija + cabecera) y toque fuera.
- **`legalSheetContent.js`**: textos para `terms`, `privacy`, `about`; versión de app leyendo **`APP_VERSION`**.

### Estilo del contenido
- Títulos de bloque en **negro** (claro) / **blanco** (oscuro), sin verde.
- **Numeración romana en mayúsculas** + título en mayúsculas (ej. `I. ACEPTACIÓN`).

### Export
- `src/components/legal/index.js` exporta `LegalBottomSheet`.

---

## 3. Sectores favoritos y visibilidad en el home

### Pantalla `FavoriteSectorsPage` (`/perfil/sectores`)
- Entrada animada **de derecha a izquierda**; salida hacia la derecha y `navigate(-1)`.
- Cabecera con **flecha atrás** (arriba a la izquierda) y título «Sectores favoritos».
- Lista de sectores (todos salvo «Todo») con **interruptores** para mostrar u ocultar cada uno en el carrusel del inicio.
- Switch rediseñado: pista 51px, thumb posicionado con `left`/`translate-x` fijos y padding derecho + **safe area** para evitar recortes en móvil.

### Estado persistente
- **`SectorVisibilityProvider`** (`src/contexts/SectorVisibilityContext.jsx`): mapa `sectorId → visible`, persistido en **`localStorage`** (`quehayhoy-sector-visibility-v1`).
- Hook **`useSectorVisibility`**: `isSectorVisible`, `setSectorVisible`.

### Datos compartidos
- **`src/lib/topSectors.js`**: lista única de sectores (id, label, imagen).
- **`SectorSelector.jsx`**: importa desde `topSectors`, filtra por visibilidad; sigue exportando **`SECTORS`** para compatibilidad (p. ej. `AdminEventForm`).

### Home (`App.jsx`)
- **`effectiveSector`**: si el sector seleccionado está oculto, el filtro de eventos usa **`all`** sin `useEffect` de reset (derivado con `useMemo`).
- **`SectorSelector`** recibe **`effectiveSector`** como activo para coherencia con los datos.

### `main.jsx`
- App envuelta en **`SectorVisibilityProvider`** (junto a `AuthProvider` / `ThemeProvider`).
- Ruta **`/perfil/sectores`** → `FavoriteSectorsPage`.

---

## 4. Archivos tocados (referencia rápida)

| Área | Archivos principales |
|------|----------------------|
| Perfil | `src/pages/ProfilePage.jsx` |
| Legales | `src/components/legal/LegalBottomSheet.jsx`, `legalSheetContent.js`, `index.js` |
| Versión | `src/lib/appVersion.js`, `src/lib/index.js` |
| Sectores | `src/lib/topSectors.js`, `src/pages/FavoriteSectorsPage.jsx`, `src/contexts/SectorVisibilityContext.jsx` |
| Home / selector | `src/components/events/SectorSelector.jsx`, `src/App.jsx` |
| Rutas | `src/main.jsx`, `src/components/layout/BottomNav.jsx` |

---

## 5. Notas para el equipo

- Los textos legales en `legalSheetContent.js` son orientativos; conviene revisión jurídica antes de producción.
- Para cambiar la versión visible: editar **`APP_VERSION`** en `src/lib/appVersion.js`.
- La visibilidad de sectores es **por dispositivo** (localStorage), no por cuenta de usuario.

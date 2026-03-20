# 🚀 QUEHAYHOY - Roadmap de Desarrollo (MVP)

Este documento detalla los próximos pasos para la implementación de la plataforma de descubrimiento de eventos en Guayaquil.

## 🛠️ Fase 1: Filtros e Interactividad (Prioridad Alta)
- [x] **Filtros por Categoría:** Sincronizar los botones superiores (Todo, Bares, Conciertos, Comida, Cine) con consultas dinámicas de Firestore usando `where("category", "==", selectedCategory)`.
- [x] **Filtros por Sector:** Implementar selector de chips para filtrar eventos por zonas clave: *Urdesa, Samborondón, Vía a la Costa, Puerto Santa Ana*.
- [ ] **Botón "Llévame ahí":** Integrar en cada EventCard un botón que dispare un `Intent` (en móviles) hacia Google Maps o Waze con las coordenadas/dirección del evento.
- [ ] **Ajuste de UI (Scroll):** Añadir `padding-bottom` (aprox. 80px) al contenedor principal para evitar que el botón flotante de "Filter" oculte información.

## 👤 Fase 2: Usuarios y Personalización
- [ ] **Autenticación Multi-plataforma:** - [ ] Login con Google (Firebase Auth).
  - [ ] Login con Apple (Indispensable para despliegue en App Store).
- [ ] **Sistema de Favoritos:** Permitir que usuarios logueados guarden planes en una sub-colección `users/{userId}/favorites`.
- [ ] **Acceso Progresivo:** Mantener la navegación libre para invitados, solicitando login solo al intentar interactuar o guardar.

## 📍 Fase 3: Geolocalización y Mapas
- [ ] **Mapa Interactivo:** Vista de mapa (Google Maps SDK o Mapbox) con marcadores de todos los eventos disponibles hoy.
- [ ] **Filtro de Proximidad:** Ordenar eventos automáticamente basados en la distancia real del usuario.

## 🔔 Fase 4: Engagement y Notificaciones
- [ ] **Notificaciones Push (FCM):** Envío de alertas sobre eventos "Masivos" o planes de último minuto el fin de semana.
- [ ] **Badges de Aforo Dinámicos:** Lógica para actualizar en tiempo real el estado (`✨ Exclusivo`, `👥 Social`, `🔥 Masivo`) según el feedback o reportes.

---

> **Nota Técnica para Firestore:** Asegurarse de que cada documento en la colección `events` contenga los campos: `category`, `sector`, `location_coords` (GeoPoint), y `capacity_level` con strings en mayúsculas para coincidir con la lógica de los componentes.

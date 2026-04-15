/**
 * Mapa Google a pantalla completa con marcadores personalizados por categoría.
 * Con zoom suficiente se muestra el nombre del evento junto al pin (estilo similar a etiquetas POI).
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GoogleMap,
  Marker,
  OVERLAY_LAYER,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api'
import { GUAYAQUIL_DEFAULT, getEventMapPosition } from '../../lib/exploreGeo.js'
import { firestoreCategoryToId } from '../../lib/exploreFilters.js'
import {
  getDefaultBrandMarkerDataUrl,
  getEmojiMarkerDataUrl,
  MARKER_MAP_ANCHOR_X,
  MARKER_MAP_ANCHOR_Y,
  MARKER_MAP_SCALED_HEIGHT,
  MARKER_MAP_SCALED_WIDTH,
} from '../../lib/mapMarkerIcon.js'
import { CATEGORIES } from '../events/CategorySelector.jsx'

/** Solo con bastante acercamiento (zoom alto) para no saturar; sube el número = hace falta más zoom-in. */
const EVENT_LABEL_MIN_ZOOM = 16

/** Título completo para la etiqueta del mapa (sin truncar). */
function eventMapLabelFullText(event) {
  const raw = typeof event.title === 'string' ? event.title.trim() : ''
  return raw || 'Evento'
}

/**
 * Exactamente dos líneas lógicas: cada una en una sola fila (whitespace-nowrap en el DOM).
 * Orden: " — " / " - ", luego ": ", luego reparto equilibrado por palabras.
 * @param {{ title?: string }} event
 * @returns {[string, string]}
 */
function eventMapLabelLines(event) {
  const text = eventMapLabelFullText(event)

  const dash = text.match(/\s[—\-]\s/)
  if (dash && typeof dash.index === 'number') {
    const i = dash.index
    const a = text.slice(0, i).trim()
    const b = text.slice(i + dash[0].length).trim()
    if (a && b) return [a, b]
  }

  const colon = text.match(/:\s+/)
  if (colon && typeof colon.index === 'number' && colon.index > 0) {
    const i = colon.index
    const a = text.slice(0, i).trim()
    const b = text.slice(i + colon[0].length).trim()
    if (a && b) return [a, b]
  }

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [text, '']
  let bestK = 1
  let bestDiff = Infinity
  for (let k = 1; k < words.length; k += 1) {
    const a = words.slice(0, k).join(' ')
    const b = words.slice(k).join(' ')
    const diff = Math.abs(a.length - b.length)
    if (diff < bestDiff) {
      bestDiff = diff
      bestK = k
    }
  }
  return [words.slice(0, bestK).join(' '), words.slice(bestK).join(' ')]
}

/** Color del título junto al pin (similar a POI de Google Maps: acento por categoría). */
const CATEGORY_MAP_LABEL_HEX = {
  bares: { light: '#b45309', dark: '#fbbf24' },
  conciertos: { light: '#b91c1c', dark: '#fca5a5' },
  comida: { light: '#c2410c', dark: '#fdba74' },
  cine: { light: '#7e22ce', dark: '#d8b4fe' },
  ferias: { light: '#047857', dark: '#6ee7b7' },
  videojuegos: { light: '#1d4ed8', dark: '#93c5fd' },
  all: { light: '#0f766e', dark: '#5eead4' },
}

/** @param {string} categoryId */
function mapLabelColorForCategory(categoryId, isDark) {
  const pair = CATEGORY_MAP_LABEL_HEX[categoryId] ?? CATEGORY_MAP_LABEL_HEX.all
  return isDark ? pair.dark : pair.light
}

/** Espacio entre el borde derecho del icono (40×40) y el inicio del texto (px). */
const EVENT_LABEL_GAP_PX = 4

/** Sube la etiqueta respecto al pin (px); a mayor valor, más arriba en pantalla. */
const EVENT_LABEL_NUDGE_UP_PX = 4

/** Modo oscuro: colores propios + sin POI (restaurantes, hospitales, etc.). */
const MAP_STYLES_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
]

/**
 * Modo claro: mapa estándar pero sin POI (restaurantes, hoteles, hospitales, etc.)
 * ni capa de transporte, para acercarse a la claridad del modo oscuro.
 */
const MAP_STYLES_LIGHT = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

/**
 * @param {{ id: string, category?: string }} event
 * @returns {string} data URL
 */
function markerIconUrlForEvent(event) {
  const cid = firestoreCategoryToId(event.category)
  const cat = CATEGORIES.find((c) => c.id === cid)
  if (cat && cat.id !== 'all') {
    return getEmojiMarkerDataUrl(cat.icon)
  }
  return getDefaultBrandMarkerDataUrl()
}

/**
 * @param {{
 *   apiKey: string
 *   isDark: boolean
 *   events: Array<{ id: string, category?: string }>
 *   onSelectEvent: (event: { id: string, category?: string }) => void
 *   onMapClick: () => void
 * }} props
 */
export function ExploreMapView({
  apiKey,
  isDark,
  events,
  onSelectEvent,
  onMapClick,
}) {
  const mapRef = useRef(null)
  const zoomListenerRef = useRef(/** @type {{ remove: () => void } | null} */ (null))
  const [mapZoom, setMapZoom] = useState(12)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'qh-google-maps-explore',
    googleMapsApiKey: apiKey,
    language: 'es',
    region: 'EC',
  })

  const onLoad = useCallback((map) => {
    mapRef.current = map
    const syncZoom = () => setMapZoom(map.getZoom() ?? 12)
    syncZoom()
    zoomListenerRef.current?.remove()
    zoomListenerRef.current = map.addListener('zoom_changed', syncZoom)
  }, [])

  const onUnmount = useCallback(() => {
    zoomListenerRef.current?.remove()
    zoomListenerRef.current = null
    mapRef.current = null
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isLoaded || typeof window === 'undefined' || !window.google) return
    if (events.length === 0) {
      map.setCenter(GUAYAQUIL_DEFAULT)
      map.setZoom(12)
      setMapZoom(12)
      return
    }
    const bounds = new window.google.maps.LatLngBounds()
    events.forEach((e) => {
      const p = getEventMapPosition(e)
      bounds.extend(p)
    })
    map.fitBounds(bounds, { top: 132, right: 28, bottom: 200, left: 28 })
    /** Tras ajustar bounds el zoom cambia; `idle` asegura que el estado coincida (etiquetas de evento). */
    const idleHandle = window.google.maps.event.addListenerOnce(map, 'idle', () => {
      setMapZoom(map.getZoom() ?? 12)
    })
    return () => {
      window.google.maps.event.removeListener(idleHandle)
    }
  }, [events, isLoaded])

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      minZoom: 11,
      maxZoom: 18,
      styles: isDark ? MAP_STYLES_DARK : MAP_STYLES_LIGHT,
    }),
    [isDark]
  )

  const buildIcon = useCallback((event) => {
    if (typeof window === 'undefined' || !window.google) return undefined
    const url = markerIconUrlForEvent(event)
    return {
      url,
      scaledSize: new window.google.maps.Size(MARKER_MAP_SCALED_WIDTH, MARKER_MAP_SCALED_HEIGHT),
      anchor: new window.google.maps.Point(MARKER_MAP_ANCHOR_X, MARKER_MAP_ANCHOR_Y),
    }
  }, [])

  const showEventLabels = mapZoom >= EVENT_LABEL_MIN_ZOOM

  const eventLabelPixelOffset = useCallback((/** @type {number} */ _w, /** @type {number} */ h) => {
    // El lat/lng del Marker coincide con el ancla del PNG (punta del pin). El icono mide 40×40;
    // el ancla está en x=20 (centro horizontal del círculo), así que el borde derecho del icono
    // queda a +20px del punto: el texto empieza justo a la derecha del dibujo.
    const tipToRightEdge = MARKER_MAP_SCALED_WIDTH - MARKER_MAP_ANCHOR_X
    const tipToVisualCenterY = MARKER_MAP_ANCHOR_Y - MARKER_MAP_SCALED_HEIGHT / 2
    return {
      x: tipToRightEdge + EVENT_LABEL_GAP_PX,
      y: -tipToVisualCenterY - h / 2 - EVENT_LABEL_NUDGE_UP_PX,
    }
  }, [])

  if (loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-200 px-6 text-center dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          No se pudo cargar Google Maps.
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{String(loadError.message)}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
        Cargando mapa…
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerClassName="h-full w-full"
      center={GUAYAQUIL_DEFAULT}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
      onClick={onMapClick}
    >
      {events.map((event) => {
        const titleFull =
          typeof event.title === 'string' && event.title.trim() !== '' ? event.title.trim() : 'Evento'
        const pos = getEventMapPosition(event)
        const [line1, line2] = eventMapLabelLines(event)
        const catId = firestoreCategoryToId(event.category)
        const labelColor = mapLabelColorForCategory(catId, isDark)
        return (
          <Fragment key={event.id}>
            <Marker position={pos} icon={buildIcon(event)} title={titleFull} onClick={() => onSelectEvent(event)} />
            {showEventLabels ? (
              <OverlayView
                mapPaneName={OVERLAY_LAYER}
                position={pos}
                getPixelPositionOffset={eventLabelPixelOffset}
              >
                {/*
                  OverlayView dibuja HTML fijo en el mapa (no es tooltip ni requiere hover).
                  pointer-events-auto: en móvil se puede tocar el texto para abrir el evento.
                */}
                <button
                  type="button"
                  className="qh-event-map-marker-label w-max max-w-[min(calc(100vw-2.5rem),28rem)] cursor-pointer touch-manipulation overflow-visible rounded-sm border-0 bg-transparent p-0 text-left text-[10px] font-semibold leading-[1.12] tracking-tight"
                  style={{ color: labelColor }}
                  aria-label={titleFull}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectEvent(event)
                  }}
                >
                  <span className="block whitespace-nowrap">{line1}</span>
                  {line2 ? (
                    <span className="mt-px block whitespace-nowrap">{line2}</span>
                  ) : null}
                </button>
              </OverlayView>
            ) : null}
          </Fragment>
        )
      })}
    </GoogleMap>
  )
}

export default ExploreMapView

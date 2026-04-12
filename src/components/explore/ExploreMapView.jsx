/**
 * Mapa Google a pantalla completa con marcadores personalizados por categoría.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { GUAYAQUIL_DEFAULT, getEventMapPosition } from '../../lib/exploreGeo.js'
import { firestoreCategoryToId } from '../../lib/exploreFilters.js'
import { getDefaultBrandMarkerDataUrl, getEmojiMarkerDataUrl } from '../../lib/mapMarkerIcon.js'
import { CATEGORIES } from '../events/CategorySelector.jsx'

const MAP_STYLES_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
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

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'qh-google-maps-explore',
    googleMapsApiKey: apiKey,
    language: 'es',
    region: 'EC',
  })

  const onLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isLoaded || typeof window === 'undefined' || !window.google) return
    if (events.length === 0) {
      map.setCenter(GUAYAQUIL_DEFAULT)
      map.setZoom(12)
      return
    }
    const bounds = new window.google.maps.LatLngBounds()
    events.forEach((e) => {
      const p = getEventMapPosition(e)
      bounds.extend(p)
    })
    map.fitBounds(bounds, { top: 132, right: 28, bottom: 200, left: 28 })
  }, [events, isLoaded])

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      minZoom: 11,
      maxZoom: 18,
      styles: isDark ? MAP_STYLES_DARK : undefined,
    }),
    [isDark]
  )

  const buildIcon = useCallback((event) => {
    if (typeof window === 'undefined' || !window.google) return undefined
    const url = markerIconUrlForEvent(event)
    return {
      url,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 36),
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
      {events.map((event) => (
        <Marker
          key={event.id}
          position={getEventMapPosition(event)}
          icon={buildIcon(event)}
          onClick={() => onSelectEvent(event)}
        />
      ))}
    </GoogleMap>
  )
}

export default ExploreMapView

/**
 * Geocodificación en el navegador con Maps JavaScript API (Geocoder).
 * Requiere `VITE_GOOGLE_MAPS_API_KEY` y la API **Geocoding** habilitada en Google Cloud.
 */
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

/** @type {Promise<void> | null} */
let loadGeocodingPromise = null

/** Si ya aplicamos `setOptions` en esta sesión (v2 solo debería configurarse una vez). */
let optionsConfigured = false

/**
 * @param {string} apiKey
 * @returns {Promise<void>}
 */
async function ensureGeocodingLoaded(apiKey) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('La geocodificación solo está disponible en el navegador.'))
  }
  if (!apiKey) {
    return Promise.reject(new Error('Configura VITE_GOOGLE_MAPS_API_KEY en tu archivo .env.'))
  }

  if (window.google?.maps?.Geocoder) {
    return undefined
  }

  if (!loadGeocodingPromise) {
    loadGeocodingPromise = (async () => {
      if (!optionsConfigured) {
        setOptions({
          key: apiKey,
          v: 'weekly',
          language: 'es',
          region: 'EC',
        })
        optionsConfigured = true
      }
      await importLibrary('geocoding')
      if (!window.google?.maps?.Geocoder) {
        throw new Error('No se pudo inicializar el geocodificador de Google Maps.')
      }
    })().catch((err) => {
      loadGeocodingPromise = null
      throw err
    })
  }

  await loadGeocodingPromise
}

/**
 * @param {string} addressQuery - Dirección completa sugerida (incl. ciudad/país).
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export async function geocodeAddressString(addressQuery) {
  const trimmed = addressQuery?.trim()
  if (!trimmed) {
    return Promise.reject(new Error('Indica una dirección o contexto para buscar.'))
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''
  await ensureGeocodingLoaded(apiKey)

  const GeocoderCtor = window.google.maps.Geocoder
  const geocoder = new GeocoderCtor()

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: trimmed }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location
        resolve({ lat: loc.lat(), lng: loc.lng() })
        return
      }
      const human =
        status === 'ZERO_RESULTS'
          ? 'No se encontró esa ubicación. Prueba con más detalle en la dirección.'
          : status === 'OVER_QUERY_LIMIT'
            ? 'Límite de consultas de geocodificación. Intenta más tarde.'
            : status === 'REQUEST_DENIED'
              ? 'Geocodificación denegada: revisa la clave de API y que la API Geocoding esté habilitada.'
              : `No se pudo geocodificar (${status}).`
      reject(new Error(human))
    })
  })
}

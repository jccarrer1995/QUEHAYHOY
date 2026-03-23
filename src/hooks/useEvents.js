import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { formatRecurrenceLabel } from '../lib/index.js'

/**
 * Convierte date de Firestore (Timestamp, string, number) a string para renderizado
 * @param {unknown} dateValue
 * @returns {string}
 */
function formatDateForDisplay(dateValue) {
  if (dateValue == null || dateValue === '') return ''
  if (typeof dateValue === 'string') return dateValue
  if (typeof dateValue === 'number') return String(dateValue)
  if (typeof dateValue === 'object' && typeof dateValue?.toDate === 'function') {
    const d = dateValue.toDate()
    return d.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    const d = new Date(dateValue.seconds * 1000)
    return d.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return String(dateValue)
}

/**
 * @param {import('firebase/firestore').Timestamp | { seconds?: number } | null | undefined} ts
 * @returns {number}
 */
function timestampToMs(ts) {
  if (ts == null) return Number.POSITIVE_INFINITY
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts === 'object' && typeof ts.seconds === 'number') return ts.seconds * 1000
  return Number.POSITIVE_INFINITY
}

/**
 * @param {Record<string, unknown>} data
 * @returns {'unique' | 'recurring'}
 */
function resolveEventType(data) {
  if (data.type === 'unique' || data.type === 'recurring') return data.type
  if (data.eventType === 'recurring') return 'recurring'
  return 'unique'
}

/** Mapea documento Firestore al formato de la app */
function mapDocToEvent(doc) {
  const data = doc.data()
  const type = resolveEventType(data)
  const endTs = type === 'unique' ? data.endDate ?? data.date : null
  const endDateMs = type === 'unique' ? timestampToMs(endTs) : null

  let dateDisplay = ''
  if (type === 'recurring') {
    const rd = data.recurrence_day
    if (rd == null || rd === '') {
      dateDisplay = ''
    } else {
      const n = typeof rd === 'number' ? rd : Number(rd)
      dateDisplay = Number.isNaN(n) ? '' : formatRecurrenceLabel(n)
    }
  } else {
    dateDisplay = formatDateForDisplay(data.date)
  }

  return {
    id: doc.id,
    title: data.title ?? '',
    sector: data.location ?? data.sector ?? '',
    date: dateDisplay,
    type,
    recurrence_day:
      data.recurrence_day == null || data.recurrence_day === ''
        ? null
        : Number(data.recurrence_day),
    endDateMs,
    capacity_level: data.capacity_level ?? null,
    capacity: data.capacity ?? null,
    price: data.price ?? null,
    imageUrl: data.image_url ?? data.imageUrl ?? null,
    category: data.category ?? 'all',
    description: data.description ?? '',
  }
}

/** Mapea id de sector a valor en Firestore (location/sector) */
const SECTOR_TO_FIRESTORE = {
  urdesa: 'Urdesa',
  'las-penas': 'Las Peñas',
  guayarte: 'Guayarte',
  samanes: 'Samanes',
}

/**
 * Filtro en cliente (categoría / sector) para no componer índices con type + rango.
 * @param {ReturnType<typeof mapDocToEvent>} event
 * @param {string | null} firestoreCategory
 * @param {string | null} firestoreSector
 */
function matchesCategoryAndSector(event, firestoreCategory, firestoreSector) {
  if (firestoreCategory) {
    const c = (event.category ?? '').trim()
    if (c !== firestoreCategory) return false
  }
  if (firestoreSector) {
    const s = (event.sector ?? '').trim()
    if (s !== firestoreSector) return false
  }
  return true
}

/**
 * Únicos primero por fecha fin más cercana; luego recurrentes (orden estable por título).
 * @param {ReturnType<typeof mapDocToEvent>[]} list
 */
function sortHomeEvents(list) {
  const uniques = list
    .filter((e) => e.type === 'unique')
    .sort((a, b) => (a.endDateMs ?? 0) - (b.endDateMs ?? 0))
  const recurring = list
    .filter((e) => e.type === 'recurring')
    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'es'))
  return [...uniques, ...recurring]
}

/**
 * Hook para obtener eventos desde Firestore (colección events)
 * Consultas separadas: únicos con endDate futuro y recurrentes con active_until futuro.
 * @param {string} [category] - Si es 'all' o vacío, trae todos. Si no, filtra por category
 * @param {string} [sector] - Si es 'all' o vacío, no filtra. Si no, filtra por sector
 */
export function useEvents(category = 'all', sector = 'all') {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      if (!db) {
        setLoading(false)
        setError('Firebase no configurado')
        return
      }

      setLoading(true)
      setError(null)

      const colRef = collection(db, 'events')
      const firestoreCategory =
        category && category !== 'all'
          ? category.charAt(0).toUpperCase() + category.slice(1)
          : null
      const firestoreSector =
        sector && sector !== 'all' ? SECTOR_TO_FIRESTORE[sector] ?? sector : null

      const now = Timestamp.now()

      // Solo type + campo de rango por consulta (índices simples; sin category/sector en Firestore)
      const qUnique = query(
        colRef,
        where('isVisible', '==', true),
        where('type', '==', 'unique'),
        where('endDate', '>=', now)
      )
      const qRecurring = query(
        colRef,
        where('isVisible', '==', true),
        where('type', '==', 'recurring'),
        where('active_until', '>=', now)
      )

      Promise.all([getDocs(qUnique), getDocs(qRecurring)])
        .then(([snapUnique, snapRecurring]) => {
          if (cancelled) return
          const byId = new Map()
          for (const d of snapUnique.docs) {
            byId.set(d.id, mapDocToEvent(d))
          }
          for (const d of snapRecurring.docs) {
            byId.set(d.id, mapDocToEvent(d))
          }
          const combined = [...byId.values()].filter((ev) =>
            matchesCategoryAndSector(ev, firestoreCategory, firestoreSector)
          )
          const merged = sortHomeEvents(combined)
          setEvents(merged)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.message ?? 'Error al cargar eventos')
          setEvents([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [category, sector])

  return { events, loading, error }
}

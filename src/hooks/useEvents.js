import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'

/**
 * Convierte date de Firestore (Timestamp, string, number) a string para renderizado
 */
function formatDateForDisplay(dateValue) {
  if (dateValue == null || dateValue === '') return ''
  if (typeof dateValue === 'string') return dateValue
  if (typeof dateValue === 'number') return String(dateValue)
  if (typeof dateValue === 'object' && typeof dateValue?.toDate === 'function') {
    const d = dateValue.toDate()
    return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    const d = new Date(dateValue.seconds * 1000)
    return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return String(dateValue)
}

/**
 * Mapea documento Firestore al formato de la app
 * Firestore: title, location, date, capacity_level, price, image_url, category?
 */
function mapDocToEvent(doc) {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title ?? '',
    sector: data.location ?? data.sector ?? '',
    date: formatDateForDisplay(data.date),
    capacity_level: data.capacity_level ?? null,
    capacity: data.capacity ?? null,
    price: data.price ?? null,
    imageUrl: data.image_url ?? data.imageUrl ?? null,
    category: data.category ?? 'all',
    description: data.description ?? '',
  }
}

/** Campo en Firestore para zona: "sector" o "location" según tu colección */
const SECTOR_FIELD = 'sector'

/** Mapea id de sector a valor en Firestore (location/sector) */
const SECTOR_TO_FIRESTORE = {
  urdesa: 'Urdesa',
  'las-penas': 'Las Peñas',
  guayarte: 'Guayarte',
  samanes: 'Samanes',
}

/**
 * Hook para obtener eventos desde Firestore (colección events)
 * @param {string} [category] - Si es 'all' o vacío, trae todos. Si no, filtra por where("category", "==", category)
 * @param {string} [sector] - Si es 'all' o vacío, no filtra. Si no, filtra por where("sector", "==", sector) o where("location", "==", sector)
 */
export function useEvents(category = 'all', sector = 'all') {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      setError('Firebase no configurado')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const colRef = collection(db, 'events')
    const firestoreCategory =
      category && category !== 'all'
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : null
    const firestoreSector =
      sector && sector !== 'all' ? SECTOR_TO_FIRESTORE[sector] ?? sector : null

    let firestoreQuery = colRef
    const constraints = []
    if (firestoreCategory) constraints.push(where('category', '==', firestoreCategory))
    if (firestoreSector) constraints.push(where(SECTOR_FIELD, '==', firestoreSector))
    if (constraints.length > 0) {
      firestoreQuery = query(colRef, ...constraints)
    }

    getDocs(firestoreQuery)
      .then((snapshot) => {
        if (cancelled) return
        const list = snapshot.docs.map(mapDocToEvent)
        setEvents(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message ?? 'Error al cargar eventos')
        setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [category, sector])

  return { events, loading, error }
}

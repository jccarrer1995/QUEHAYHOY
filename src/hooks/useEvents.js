import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'

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
    date: data.date ?? '',
    capacity_level: data.capacity_level ?? null,
    capacity: data.capacity ?? null,
    price: data.price ?? null,
    imageUrl: data.image_url ?? data.imageUrl ?? null,
    category: data.category ?? 'all',
    description: data.description ?? '',
  }
}

/**
 * Hook para obtener eventos desde Firestore (colección events)
 */
export function useEvents() {
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

    getDocs(collection(db, 'events'))
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
  }, [])

  return { events, loading, error }
}

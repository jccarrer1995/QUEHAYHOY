import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../config/firebaseConfig'
import { EventCardCarousel } from './EventCardCarousel'

/**
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
    const d = new Date(Number(dateValue.seconds) * 1000)
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
 * @param {unknown} ts
 * @returns {number}
 */
function toMs(ts) {
  if (ts == null) return Number.NaN
  if (typeof ts === 'object' && typeof ts?.toMillis === 'function') return ts.toMillis()
  if (typeof ts === 'object' && typeof ts?.seconds === 'number') return ts.seconds * 1000
  if (typeof ts === 'number') return ts
  return Number.NaN
}

/**
 * @param {import('firebase/firestore').QueryDocumentSnapshot<import('firebase/firestore').DocumentData>} doc
 */
function mapDocToEvent(doc) {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title ?? '',
    sector: data.location ?? data.sector ?? '',
    date: formatDateForDisplay(data.date),
    price: data.price ?? null,
    imageUrl: data.image_url ?? data.imageUrl ?? null,
    category: data.category ?? 'all',
    description: data.description ?? '',
    popularidad: data.popularidad != null ? Number(data.popularidad) : 1,
    badgeType: data.badgeType ?? null,
    badgeLabel: data.badgeLabel ?? data.capacity_level ?? null,
    type: data.type ?? 'unique',
    recurrence_day: data.recurrence_day ?? null,
    createdAtMs:
      typeof data?.createdAt?.toMillis === 'function'
        ? data.createdAt.toMillis()
        : typeof data?.date?.toMillis === 'function'
          ? data.date.toMillis()
          : 0,
  }
}

/**
 * @param {{ isDark?: boolean }} props
 */
export function TodaySection({ isDark = false }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [scrollerEl, setScrollerEl] = useState(null)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      setError('Firebase no configurado')
      return () => {}
    }

    setLoading(true)
    setError(null)

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const todayWeekday = now.getDay()
    const qVisible = query(collection(db, 'events'), where('isVisible', '==', true))

    const unsubVisible = onSnapshot(
      qVisible,
      (snapshot) => {
        const filtered = snapshot.docs
          .map((doc) => ({ id: doc.id, data: doc.data() }))
          .filter(({ data }) => {
            const type = data.type ?? data.eventType ?? 'unique'
            if (type === 'recurring') {
              const recurrenceDay = Number(data.recurrence_day)
              const activeUntilMs = toMs(data.active_until)
              return recurrenceDay === todayWeekday && (Number.isNaN(activeUntilMs) || activeUntilMs >= now.getTime())
            }

            const dateMs = toMs(data.date)
            return dateMs >= startOfDay.getTime() && dateMs < endOfDay.getTime()
          })
          .map(({ id, data }) => mapDocToEvent({ id, data: () => data }))
          .sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0))
          .slice(0, 3)

        setEvents(filtered)
        setLoading(false)
      },
      (err) => {
        setError(err?.message ?? 'No se pudo cargar eventos de hoy')
        setLoading(false)
      }
    )

    return () => {
      unsubVisible()
    }
  }, [])

  const emptyTextColor = isDark ? 'text-gray-400' : 'text-gray-600'

  function updateScrollState() {
    if (!scrollerEl) return
    const maxScrollLeft = Math.max(0, scrollerEl.scrollWidth - scrollerEl.clientWidth)
    setHasOverflow(maxScrollLeft > 4)
    setCanScrollLeft(scrollerEl.scrollLeft > 4)
    setCanScrollRight(scrollerEl.scrollLeft < maxScrollLeft - 4)
  }

  useEffect(() => {
    updateScrollState()
  }, [events.length, scrollerEl])

  useEffect(() => {
    if (!scrollerEl) return
    const onScroll = () => updateScrollState()
    const onResize = () => updateScrollState()
    scrollerEl.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      scrollerEl.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollerEl])

  function scrollByAmount(dir) {
    if (!scrollerEl) return
    scrollerEl.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  const emptyState = useMemo(
    () => (
      <div
        className={`rounded-2xl border px-4 py-6 text-center ${
          isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'
        }`}
      >
        
        <p className={`mt-2 text-sm ${emptyTextColor}`}>
        Tranqui por ahora... <br/> 🌴¡Chequea lo que se viene mañana!🌴
        </p>
      </div>
    ),
    [emptyTextColor, isDark]
  )

  return (
    <section
      className={`mt-0.5 pt-5 mb-5 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="animate-soft-blink text-lg" aria-hidden>
            ⚡
          </span>
          <h2
            className="text-xl font-extrabold tracking-wide animate-shine inline-block"
            style={{
              backgroundImage: 'linear-gradient(90deg, #fb923c, #facc15, #fb923c)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ¡Pilas Hoy!
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!hasOverflow || !canScrollLeft}
            className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
              !hasOverflow || !canScrollLeft
                ? isDark
                  ? 'border-gray-800 bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222]'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="Desplazar Pilas Hoy a la izquierda"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!hasOverflow || !canScrollRight}
            className={`h-8 w-8 rounded-full border flex items-center justify-center transition ${
              !hasOverflow || !canScrollRight
                ? isDark
                  ? 'border-gray-800 bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'border-gray-700 bg-[#1b1b1b] text-gray-200 hover:bg-[#222]'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="Desplazar Pilas Hoy a la derecha"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`rounded-2xl border px-4 py-6 text-center ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-sm ${emptyTextColor}`}>Cargando eventos de hoy...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 px-4 py-6 text-center bg-red-50/40 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : events.length === 0 ? (
        emptyState
      ) : (
        <div
          ref={setScrollerEl}
          className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
        >
          {events.map((event) => (
            <EventCardCarousel key={event.id} event={event} isDark={isDark} />
          ))}
        </div>
      )}
    </section>
  )
}

export default TodaySection

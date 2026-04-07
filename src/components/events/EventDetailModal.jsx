import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { doc, getDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { db } from '../../config/firebaseConfig'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { Clock, MapPin, Ticket, X } from 'lucide-react'
import { optimizeImageUrl, formatRecurrenceLabel } from '../../lib/index.js'
import { buildPublicEventUrl } from '../../lib/slug.js'

function formatDateValue(dateValue) {
  if (!dateValue) return null
  if (typeof dateValue === 'string') return dateValue
  if (typeof dateValue === 'number') return String(dateValue)
  if (typeof dateValue === 'object' && dateValue.toDate) {
    const d = dateValue.toDate()
    return d.toLocaleString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return String(dateValue)
}

function formatPriceValue(price) {
  if (price === 0 || price == null) return 'Gratis'
  const num = typeof price === 'number' ? price : Number(price)
  if (Number.isNaN(num)) return String(price)
  return num % 1 === 0 ? `$${num}` : `$${Number(num).toFixed(2)}`
}

/**
 * @param {{ eventId: string | null, open: boolean, onClose: () => void }} props
 */
export function EventDetailModal({ eventId, open, onClose }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !eventId) {
      queueMicrotask(() => {
        setEvent(null)
        setError(null)
        setLoading(false)
      })
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setEvent(null)

    const run = async () => {
      try {
        if (!db) throw new Error('Firebase no configurado')
        const snap = await getDoc(doc(db, 'events', eventId))
        if (!snap.exists()) throw new Error('Evento no encontrado')
        const data = snap.data() ?? {}
        if (cancelled) return

        const type =
          data.type === 'unique' || data.type === 'recurring'
            ? data.type
            : data.eventType === 'recurring'
              ? 'recurring'
              : 'unique'

        setEvent({
          id: snap.id,
          slug: typeof data.slug === 'string' ? data.slug : null,
          title: data.title ?? '',
          sector: data.location ?? data.sector ?? '',
          category: data.category ?? '',
          date: data.date ?? '',
          type,
          eventType: data.eventType ?? null,
          recurrence_day:
            data.recurrence_day == null || data.recurrence_day === ''
              ? null
              : Number(data.recurrence_day),
          price: data.price ?? null,
          imageUrl: data.image_url ?? data.imageUrl ?? null,
          description: data.description ?? '',
          address: data.address ?? '',
        })
      } catch (e) {
        if (cancelled) return
        setError(e?.message ?? 'Error al cargar el evento')
        setEvent(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [open, eventId])

  const locationText = useMemo(() => {
    return event?.address?.trim() || event?.sector?.trim() || 'Guayaquil'
  }, [event])

  const googleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`
  }, [locationText])

  const whatsappShareUrl = useMemo(() => {
    const eventUrl = buildPublicEventUrl(event, eventId)
    const priceLabel = formatPriceValue(event?.price)
    const sectorLabel = event?.sector?.trim() || 'Guayaquil'
    const text = `¡Mira este plan en Guayaquil! 🔥
📍 Evento: ${event?.title || 'Evento'}
🏢 Sector: ${sectorLabel}
💰 Precio: ${priceLabel}
Chequea los detalles aquí: ${eventUrl}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }, [event?.title, event?.sector, event?.price, event?.slug, eventId])

  const dateDisplayLabel = useMemo(() => {
    if (!event) return null
    const isRecurring = event.type === 'recurring' || event.eventType === 'recurring'
    if (isRecurring && event.recurrence_day != null && !Number.isNaN(Number(event.recurrence_day))) {
      return formatRecurrenceLabel(event.recurrence_day)
    }
    return formatDateValue(event.date)
  }, [event])

  const categoryLabel = useMemo(() => {
    const c = event?.category?.trim()
    if (!c || c === 'all' || c === 'All') return null
    return c
  }, [event])

  const pageBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const panelBg = isDark ? 'bg-[#161616]' : 'bg-gray-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const accent = 'text-[#14b8a6]'
  const MotionDiv = motion.div
  const MotionA = motion.a
  const MotionButton = motion.button

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl ${pageBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <div
                className={`h-10 w-10 animate-spin rounded-full border-2 border-t-transparent ${
                  isDark ? 'border-gray-500 border-t-[#14b8a6]' : 'border-gray-300 border-t-[#14b8a6]'
                }`}
              />
              <p className={`text-sm ${muted}`}>Cargando evento…</p>
            </div>
          ) : error || !event ? (
            <div className="px-6 py-10 text-center">
              <p style={{ color: isDark ? '#f87171' : '#dc2626' }}>{error ?? 'No se pudo cargar el evento.'}</p>
              <MotionButton
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.96 }}
                className="mt-6 rounded-full bg-[#14b8a6] px-6 py-3 font-semibold text-white"
              >
                Cerrar
              </MotionButton>
            </div>
          ) : (
            <>
              <header className="relative w-full shrink-0">
                <MotionDiv
                  className="relative h-[38vh] min-h-[200px] w-full sm:h-[40vh] sm:min-h-[240px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  {event.imageUrl ? (
                    <img
                      src={optimizeImageUrl(event.imageUrl)}
                      alt={event.title || 'Evento'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center text-6xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                    >
                      📅
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </MotionDiv>

                <MotionButton
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.94 }}
                  className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-5 w-5" />
                </MotionButton>
              </header>

              <MotionDiv
                className={`relative z-10 -mt-6 rounded-t-3xl px-4 pb-6 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] ${panelBg}`}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {categoryLabel ? (
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isDark ? 'bg-[#14b8a6]/20 text-[#5eead4]' : 'bg-teal-100 text-teal-800'}`}
                  >
                    {categoryLabel}
                  </span>
                ) : null}

                <h1
                  id="event-detail-modal-title"
                  className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
                  style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}
                >
                  {event.title || 'Evento'}
                </h1>

                <ul className="mt-6 space-y-4">
                  {dateDisplayLabel ? (
                    <li className="flex gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                      >
                        <Clock className={`h-5 w-5 ${accent}`} aria-hidden />
                      </span>
                      <div>
                        <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Fecha y hora</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                          {dateDisplayLabel}
                        </p>
                      </div>
                    </li>
                  ) : null}

                  <li className="flex gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                    >
                      <MapPin className={`h-5 w-5 ${accent}`} aria-hidden />
                    </span>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Ubicación</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                        {locationText}
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                    >
                      <Ticket className={`h-5 w-5 ${accent}`} aria-hidden />
                    </span>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>Precio</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                        {formatPriceValue(event.price)}
                      </p>
                    </div>
                  </li>
                </ul>

                {event.description ? (
                  <section className="mt-8">
                    <h2
                      className="mb-2 text-sm font-extrabold uppercase tracking-wide"
                      style={{ color: isDark ? '#14b8a6' : '#111827' }}
                    >
                      Sobre el evento
                    </h2>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${muted}`}>{event.description}</p>
                  </section>
                ) : null}
              </MotionDiv>
            </>
          )}
        </div>

        {!loading && !error && event ? (
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
              isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'
            } backdrop-blur-md`}
          >
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
              <MotionA
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center rounded-2xl bg-[#14b8a6] px-3 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition hover:bg-[#0d9488] md:text-base"
              >
                Abrir en Google Maps
              </MotionA>
              <MotionA
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className={`flex items-center justify-center rounded-2xl px-3 py-3.5 text-center text-sm font-semibold transition md:text-base ${
                  isDark
                    ? 'bg-green-900/40 text-green-200 border border-green-700 hover:bg-green-900/60'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                Enviar por WhatsApp
              </MotionA>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebaseConfig'
import { CalendarDays, MapPin, Tag, Users, X } from 'lucide-react'
import { optimizeImageUrl } from '../../lib/index.js'

function formatDateValue(dateValue) {
  if (!dateValue) return null
  if (typeof dateValue === 'string') return dateValue
  if (typeof dateValue === 'number') return String(dateValue)
  if (typeof dateValue === 'object' && dateValue.toDate) {
    const d = dateValue.toDate()
    return d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return String(dateValue)
}

function formatPriceValue(price) {
  if (price === 0 || price == null) return 'Gratis'
  if (typeof price === 'number') return `$${price}`
  return String(price)
}

export function EventDetail({ eventId, isDark = false, onClose }) {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Control de animación: entra desde abajo.
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const isClosingRef = useRef(false)

  const ANIM_DURATION = 320

  useEffect(() => {
    const t1 = window.setTimeout(() => setIsOpen(true), 20)
    return () => window.clearTimeout(t1)
  }, [])

  // Mostrar contenido solo cuando la expansión termina.
  useEffect(() => {
    if (!isOpen || isClosing) return
    const t = window.setTimeout(() => setIsExpanded(true), ANIM_DURATION)
    return () => window.clearTimeout(t)
  }, [isOpen, isClosing])

  useEffect(() => {
    isClosingRef.current = isClosing
  }, [isClosing])

  useEffect(() => {
    if (!eventId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        if (!db) throw new Error('Firebase no configurado')
        const snap = await getDoc(doc(collection(db, 'events'), eventId))
        if (!snap.exists()) throw new Error('Evento no encontrado')
        const data = snap.data() ?? {}
        if (cancelled) return

        setEvent({
          id: snap.id,
          title: data.title ?? '',
          sector: data.location ?? data.sector ?? '',
          date: data.date ?? '',
          capacity_level: data.capacity_level ?? null,
          capacity: data.capacity ?? null,
          price: data.price ?? null,
          imageUrl: data.image_url ?? data.imageUrl ?? null,
          description: data.description ?? '',
          // Opcional: si existiera, lo usamos para “Ver en Maps” más exacto
          address: data.address ?? '',
        })
      } catch (e) {
        if (cancelled) return
        setError(e?.message ?? 'Error al cargar detalle del evento')
        setEvent(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId])

  // Bloquear scroll mientras el sheet está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const closeTimerRef = useRef(null)

  function handleClose() {
    if (isClosingRef.current) return
    setIsClosing(true)
    isClosingRef.current = true
    setIsOpen(false)
    setIsExpanded(false)
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => onClose?.(), ANIM_DURATION)
  }

  const locationText = event?.address || event?.sector || 'Guayaquil'
  const googleMapsSearchUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`
  }, [locationText])

  const mapEmbedSrc = useMemo(() => {
    return `https://www.google.com/maps?q=${encodeURIComponent(locationText)}&output=embed`
  }, [locationText])

  const sheetPanelBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const sheetPanelBorder = isDark ? 'border-gray-800' : 'border-gray-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const accent = 'text-[#14b8a6]'

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />

      {/* sheet */}
      <div
        className={`relative w-full transition-transform ${
          isOpen && !isClosing ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transitionDuration: `${ANIM_DURATION}ms`,
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          className={`mx-auto w-full sm:max-w-3xl rounded-t-3xl border ${sheetPanelBorder} ${sheetPanelBg} overflow-hidden relative`}
          style={{ maxHeight: '92vh' }}
        >
          {isExpanded ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800">
                  {!loading && event?.imageUrl ? (
                    <img src={optimizeImageUrl(event.imageUrl)} alt={event?.title ?? 'Evento'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">🎟️</div>
                  )}
                </div>
              </div>

              <div className="p-4 pb-28 sm:pb-24 overflow-y-auto">
                {error ? (
                  <p className="py-10 text-center" style={{ color: isDark ? '#ef4444' : '#dc2626' }}>
                    {error}
                  </p>
                ) : !loading && event ? (
                  <>
                    <h2
                      className="text-lg font-bold leading-snug line-clamp-2"
                      style={{ color: isDark ? '#E0E0E0' : '#111827' }}
                    >
                      {event?.title}
                    </h2>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className={`w-4 h-4 ${accent}`} />
                        <span className={muted}>{formatDateValue(event?.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${accent}`} />
                        <span className={muted}>{event?.sector}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className={`w-4 h-4 ${accent}`} />
                        <span className={muted}>{formatPriceValue(event?.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${accent}`} />
                        <span className={muted}>
                          {event?.capacity_level ? event.capacity_level : 'Sin aforo'}
                          {event?.capacity != null ? ` (${event.capacity})` : ''}
                        </span>
                      </div>
                    </div>

                    {event?.description ? (
                      <p className={`mt-3 ${muted} text-sm leading-relaxed line-clamp-3`}>{event.description}</p>
                    ) : null}

                    <div className="mt-4">
                      <h3 className={`text-sm font-bold ${accent} mb-2`}>Mapa</h3>
                      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        <iframe
                          title="Mapa del evento"
                          className="w-full h-40"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={mapEmbedSrc}
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <div className={`min-h-[85vh] sm:min-h-[80vh] ${sheetPanelBg}`} aria-hidden />
          )}
        </div>

        {/* CTA fijo */}
        {!loading && !error ? (
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-14 left-4 right-4 z-[90] md:bottom-4 md:left-4 md:right-4 md:rounded-2xl md:shadow-lg"
            style={{ maxWidth: 720, marginInline: 'auto' }}
          >
            <div className="w-full bg-[#14b8a6] text-white rounded-2xl px-4 py-3">
              <div className="text-center font-semibold">¿CÓMO LLEGAR? abrir en Maps</div>
            </div>
          </a>
        ) : null}
      </div>
    </div>
  )
}

export default EventDetail


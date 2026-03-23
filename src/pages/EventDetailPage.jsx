import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { db } from '../config/firebaseConfig'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { ArrowLeft, Clock, MapPin, Ticket } from 'lucide-react'
import { optimizeImageUrl, formatRecurrenceLabel } from '../lib/index.js'
import { EventDetailPageSkeleton } from './EventDetailPageSkeleton.jsx'

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
  if (typeof price === 'number') return `$${price}`
  return String(price)
}

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    if (!id) {
      setError('Evento no especificado')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setEvent(null)

    const run = async () => {
      try {
        if (!db) throw new Error('Firebase no configurado')
        const snap = await getDoc(doc(db, 'events', id))
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
  }, [id])

  const locationText = useMemo(() => {
    return event?.address?.trim() || event?.sector?.trim() || 'Guayaquil'
  }, [event])

  const googleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`
  }, [locationText])

  const whatsappShareUrl = useMemo(() => {
    const eventUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://quehayhoy.app/evento/${id ?? ''}`
    const priceLabel = formatPriceValue(event?.price)
    const sectorLabel = event?.sector?.trim() || 'Guayaquil'
    const text = `¡Mira este plan en Guayaquil! 🔥
📍 Evento: ${event?.title || 'Evento'}
🏢 Sector: ${sectorLabel}
💰 Precio: ${priceLabel}
Chequea los detalles aquí: ${eventUrl}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }, [event?.title, event?.sector, event?.price, id])

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

  if (loading) {
    return <EventDetailPageSkeleton isDark={isDark} />
  }

  if (error || !event) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${pageBg}`}>
        <p className="text-center mb-6" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
          {error ?? 'No se pudo cargar el evento.'}
        </p>
        <MotionButton
          type="button"
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.96 }}
          className="rounded-full bg-[#14b8a6] px-6 py-3 font-semibold text-white"
        >
          Volver al inicio
        </MotionButton>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${pageBg} pb-28`}>
      {/* Cabecera: imagen a ancho completo */}
      <header className="relative w-full">
        <MotionDiv
          className="relative h-[42vh] min-h-[220px] w-full sm:h-[45vh] sm:min-h-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.94 }}
          className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-5 w-5" />
        </MotionButton>
      </header>

      {/* Cuerpo con overlap */}
      <MotionDiv
        className={`relative z-10 -mt-6 rounded-t-3xl px-4 pb-8 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] ${panelBg}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {categoryLabel ? (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isDark ? 'bg-[#14b8a6]/20 text-[#5eead4]' : 'bg-teal-100 text-teal-800'}`}
          >
            {categoryLabel}
          </span>
        ) : null}

        <h1
          className="mt-3 text-3xl font-extrabold leading-tight tracking-tight"
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

      {/* CTA fijo */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
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
    </div>
  )
}

export default EventDetailPage

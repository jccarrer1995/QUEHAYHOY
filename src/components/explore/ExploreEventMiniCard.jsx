/**
 * Tarjeta inferior al seleccionar un marcador: resumen + Ver más.
 */
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getEventDetailPath } from '../../lib/slug.js'
import { optimizeImageUrl } from '../../lib/index.js'

/**
 * @param {{
 *   event: { id: string, title?: string, date?: string, sector?: string, imageUrl?: string | null, slug?: string | null } | null
 *   isDark: boolean
 *   onClose: () => void
 * }} props
 */
export function ExploreEventMiniCard({ event, isDark, onClose }) {
  const detailPath = event ? getEventDetailPath(event) : null
  const img = event?.imageUrl ? optimizeImageUrl(event.imageUrl, { w: 400, q: 82 }) : null

  const panel = isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const closeBtn = isDark
    ? 'border-gray-600 bg-[#2a2a2a] text-[#E0E0E0] shadow-black/40 hover:bg-[#333]'
    : 'border-gray-200 bg-white text-gray-700 shadow-md hover:bg-gray-50'

  return (
    <AnimatePresence>
      {event && detailPath ? (
        <motion.div
          key={event.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-mini-card-title"
          initial={{ y: '110%', opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '110%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 md:pb-6"
        >
          <div className="relative mx-auto max-w-lg">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={`absolute right-3 top-0 z-50 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition ${closeBtn}`}
            >
              <X className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
            <div className={`overflow-hidden rounded-2xl border shadow-2xl ${panel}`}>
              <div className="flex gap-3 p-3">
                <div
                  className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-xl ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center text-2xl ${
                        isDark ? 'text-gray-600' : 'text-gray-400'
                      }`}
                      aria-hidden
                    >
                      🎫
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    id="explore-mini-card-title"
                    className="m-0 line-clamp-2 text-base font-bold leading-snug"
                    style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
                  >
                    {event.title}
                  </h3>
                  <p className={`mt-1 text-xs ${muted}`}>
                    {[event.date, event.sector].filter(Boolean).join(' · ')}
                  </p>
                  <div className="mt-3">
                    <Link
                      to={detailPath}
                      className="inline-flex rounded-xl bg-[#14b8a6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* espacio extra para BottomNav móvil */}
          <div className="h-16 shrink-0 md:h-0" aria-hidden />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default ExploreEventMiniCard

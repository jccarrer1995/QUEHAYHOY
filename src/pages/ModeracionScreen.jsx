import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, CalendarDays, Check, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { BottomNav, Footer, Navbar } from '../components/layout'
import { useTheme } from '../contexts/ThemeContext.jsx'

const MotionArticle = motion.article
const MotionDiv = motion.div

/** @typedef {'events' | 'organizers'} ModerationTab */

/** @typedef {{ id: string, title: string, subtitle: string, type: 'organizer' | 'event' }} PendingItem */

/** @type {ReadonlyArray<PendingItem>} */
const INITIAL_PENDING_ITEMS = [
  {
    id: 'org-1',
    type: 'organizer',
    title: 'La Casa del Sabor S.A.',
    subtitle: 'Nuevo organizador · Plan Pro · hace 2 h',
  },
  {
    id: 'evt-1',
    type: 'event',
    title: 'Festival Urbano Malecón 2000',
    subtitle: 'Evento destacado · requiere revisión de imágenes',
  },
  {
    id: 'org-2',
    type: 'organizer',
    title: 'Carlos Méndez (Promotor indie)',
    subtitle: 'Verificación de identidad pendiente',
  },
  {
    id: 'evt-2',
    type: 'event',
    title: 'Noche de Stand-Up en Urdesa',
    subtitle: 'Reportado por la comunidad · revisar descripción',
  },
]

/**
 * @param {PendingItem} item
 * @returns {ReadonlyArray<{ label: string, value: string }>}
 */
function getReviewDetails(item) {
  if (item.type === 'event') {
    return [
      { label: 'Motivo de revisión', value: item.subtitle },
      { label: 'Estado', value: 'Pendiente de moderación' },
      { label: 'Organizador', value: 'Sin verificar · demo' },
      { label: 'Publicación', value: 'Borrador hasta aprobación' },
    ]
  }

  return [
    { label: 'Solicitud', value: item.subtitle },
    { label: 'Estado', value: 'Verificación pendiente' },
    { label: 'Documentos', value: 'Cédula y RUC cargados (demo)' },
    { label: 'Plan', value: 'Pro · 15 eventos/mes' },
  ]
}

/**
 * @param {{
 *   item: PendingItem | null
 *   open: boolean
 *   isDark: boolean
 *   onClose: () => void
 *   onApprove: (id: string) => void
 * }} props
 */
function ModerationReviewDialog({ item, open, isDark, onClose, onApprove }) {
  const requestClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, requestClose])

  if (!item) return null

  const panelCls = isDark
    ? 'bg-[#1a1a1a] text-[#E0E0E0] border-gray-800'
    : 'bg-white text-gray-900 border-gray-100'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const titleStyle = isDark ? { color: '#E0E0E0' } : { color: '#0a0a0a' }
  const detailBoxCls = isDark
    ? 'rounded-xl border border-gray-800 bg-[#121212]'
    : 'rounded-xl border border-gray-100 bg-[#f8fafc]'
  const TypeIcon = item.type === 'event' ? CalendarDays : Building2
  const typeLabel = item.type === 'event' ? 'Evento' : 'Organizador'
  const details = getReviewDetails(item)

  const modal = (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          key="moderation-review-dialog"
          className="fixed inset-0 z-[140] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="moderation-review-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Cerrar revisión"
            onClick={requestClose}
          />

          <MotionDiv
            className={`relative z-10 flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl ${panelCls}`}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          >
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide text-[#14b8a6]`}>Revisión de {typeLabel}</p>
                <h2 id="moderation-review-title" className="mt-1 text-lg font-bold" style={titleStyle}>
                  {item.title}
                </h2>
                <p className={`mt-1 text-sm ${mutedCls}`}>{item.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={requestClose}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
                aria-label="Cerrar"
              >
                <X className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} strokeWidth={2} />
              </button>
            </div>

            <div className="scrollbar-thin overflow-y-auto px-5 py-4">
              <div className={`mb-4 flex items-center gap-3 p-4 ${detailBoxCls}`}>
                <span className="inline-flex rounded-xl bg-[#14b8a6]/10 p-2.5 text-[#0d9488] dark:text-[#5eead4]">
                  <TypeIcon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold" style={titleStyle}>
                    Vista previa de moderación
                  </p>
                  <p className={`mt-0.5 text-xs leading-relaxed ${mutedCls}`}>
                    Aquí verías el detalle completo, imágenes y reportes antes de decidir.
                  </p>
                </div>
              </div>

              <dl className="space-y-3">
                {details.map((row) => (
                  <div key={row.label} className={`rounded-xl px-4 py-3 ${detailBoxCls}`}>
                    <dt className={`text-[11px] font-semibold uppercase tracking-wide ${mutedCls}`}>{row.label}</dt>
                    <dd className="mt-1 text-sm font-medium" style={titleStyle}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div
              className={`flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end ${
                isDark ? 'border-gray-800' : 'border-gray-100'
              }`}
            >
              <button
                type="button"
                onClick={requestClose}
                className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  isDark
                    ? 'border-gray-700 bg-[#222] text-gray-200 hover:bg-[#2a2a2a]'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onApprove(item.id)
                  requestClose()
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <Check className="h-4 w-4 text-emerald-700" strokeWidth={2.5} aria-hidden />
                Aprobar desde revisión
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}

/**
 * @param {{
 *   item: PendingItem
 *   isDark: boolean
 *   titleCls: string
 *   titleStyle: { color: string }
 *   mutedCls: string
 *   cardCls: string
 *   isApproving: boolean
 *   onApprove: (id: string) => void
 *   onReview: (id: string) => void
 * }} props
 */
function ModerationCard({
  item,
  isDark,
  titleCls,
  titleStyle,
  mutedCls,
  cardCls,
  isApproving,
  onApprove,
  onReview,
}) {
  return (
    <MotionArticle
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={
        isApproving
          ? {
              opacity: 1,
              x: 24,
              scale: 0.97,
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(236, 253, 245, 0.95)',
            }
          : { opacity: 1, x: 0, scale: 1, backgroundColor: isDark ? '#161616' : '#ffffff' }
      }
      exit={{
        opacity: 0,
        x: 48,
        scale: 0.94,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: 'hidden',
      }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className={`${cardCls} overflow-hidden p-4 sm:p-5 ${isApproving ? 'border-emerald-300 dark:border-emerald-700/60' : ''}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${titleCls}`} style={titleStyle}>
            {item.title}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${mutedCls}`}>{item.subtitle}</p>
          {isApproving ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Aprobando…
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            disabled={isApproving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2.5} aria-hidden />
            Aprobar
          </button>
          <button
            type="button"
            onClick={() => onReview(item.id)}
            disabled={isApproving}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDark
                ? 'border-gray-700 bg-[#222] text-gray-200 hover:bg-[#2a2a2a]'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Revisar
          </button>
        </div>
      </div>
    </MotionArticle>
  )
}

/**
 * Centro de moderación: eventos y organizadores pendientes de aprobación (Admin).
 */
export function ModeracionScreen() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState(/** @type {ModerationTab} */ ('events'))
  const [items, setItems] = useState(/** @type {PendingItem[]} */ ([...INITIAL_PENDING_ITEMS]))
  const [approvingId, setApprovingId] = useState(/** @type {string | null} */ (null))
  const [reviewItem, setReviewItem] = useState(/** @type {PendingItem | null} */ (null))

  const eventItems = useMemo(() => items.filter((item) => item.type === 'event'), [items])
  const organizerItems = useMemo(() => items.filter((item) => item.type === 'organizer'), [items])

  const shellCls = isDark
    ? 'min-h-screen bg-[#121212] text-[#E0E0E0]'
    : 'min-h-screen bg-[#f8fafc] text-gray-900'
  const cardCls = isDark
    ? 'rounded-2xl border border-gray-800 bg-[#161616] shadow-sm'
    : 'rounded-2xl border border-gray-100 bg-white shadow-sm'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const titleCls = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'
  const titleStyle = isDark ? { color: '#E0E0E0' } : { color: '#0a0a0a' }
  const tabBorderCls = isDark ? 'border-gray-800' : 'border-gray-200'

  const tabs = [
    { id: /** @type {ModerationTab} */ ('events'), label: 'Eventos', count: eventItems.length },
    { id: /** @type {ModerationTab} */ ('organizers'), label: 'Organizadores', count: organizerItems.length },
  ]

  const visibleItems = activeTab === 'events' ? eventItems : organizerItems

  const handleApprove = useCallback((id) => {
    if (approvingId) return

    setApprovingId(id)
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
      setApprovingId(null)
      toast.success('Elemento aprobado y retirado de la cola (demo)')
    }, 420)
  }, [approvingId])

  const handleReview = useCallback(
    (id) => {
      const item = items.find((entry) => entry.id === id) ?? null
      if (item) setReviewItem(item)
    },
    [items]
  )

  return (
    <div className={`flex flex-col pb-20 transition-colors md:pb-0 ${shellCls}`}>
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 md:py-8">
        <header className="mb-6">
          <h1 className={`text-2xl font-bold tracking-tight md:text-3xl ${titleCls}`} style={titleStyle}>
            Centro de Moderación
          </h1>
          <p className={`mt-2 max-w-xl text-sm leading-relaxed ${mutedCls}`}>
            Revisa y aprueba eventos reportados y organizadores que esperan verificación antes de publicarse en la
            plataforma.
          </p>
        </header>

        <div className={`mb-5 flex border-b ${tabBorderCls}`} role="tablist" aria-label="Filtros de moderación">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex-1 border-b-2 px-3 py-3 text-center text-sm font-semibold transition sm:px-4 ${
                  isActive
                    ? 'border-[#14b8a6] text-[#0d9488] dark:text-[#5eead4]'
                    : `border-transparent ${mutedCls} hover:text-gray-700 dark:hover:text-gray-300`
                }`}
                style={isActive && !isDark ? { color: '#0d9488' } : undefined}
              >
                {tab.label} ({tab.count})
              </button>
            )
          })}
        </div>

        <div role="tabpanel" className="space-y-3">
          {visibleItems.length === 0 ? (
            <article className={`${cardCls} px-5 py-10 text-center`}>
              <p className={`text-sm ${mutedCls}`}>No hay elementos pendientes en esta categoría.</p>
            </article>
          ) : (
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item) => (
                <ModerationCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  titleCls={titleCls}
                  titleStyle={titleStyle}
                  mutedCls={mutedCls}
                  cardCls={cardCls}
                  isApproving={approvingId === item.id}
                  onApprove={handleApprove}
                  onReview={handleReview}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      <ModerationReviewDialog
        item={reviewItem}
        open={reviewItem != null}
        isDark={isDark}
        onClose={() => setReviewItem(null)}
        onApprove={handleApprove}
      />

      <Footer />
      <BottomNav activeTab="moderation" onTabChange={() => {}} />
    </div>
  )
}

export default ModeracionScreen

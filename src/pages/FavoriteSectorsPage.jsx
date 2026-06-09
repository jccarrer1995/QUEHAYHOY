/**
 * Pantalla de visibilidad de sectores en el carrusel del home (entrada desde la derecha).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useSectorVisibility } from '../contexts/SectorVisibilityContext.jsx'
import {
  DesktopNavbar,
  GuestPreferenceWall,
  PreferenceSettingsPanel,
  PreferenceVisibilitySwitch,
} from '../components/layout'
import { SECTORS } from '../lib/topSectors.js'
import { getSectorZoneBadge } from '../lib/sectorZoneBadges.js'

const MotionDiv = motion.div
const COMPACT_TITLE_TOUCH_OFFSET = 10

const selectableSectors = SECTORS.filter((s) => s.id !== 'all')

export function FavoriteSectorsPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { user, loading: authLoading } = useAuth()
  const { visibleById, setSectorVisible } = useSectorVisibility()
  const [slideOut, setSlideOut] = useState(false)
  const [slideFromRight, setSlideFromRight] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia('(min-width: 768px)').matches : true
  )
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setSlideFromRight(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!slideOut) return undefined
    const t = window.setTimeout(() => navigate('/perfil', { replace: true }), 330)
    return () => window.clearTimeout(t)
  }, [slideOut, navigate])

  function handleBack() {
    setSlideOut(true)
  }

  function handleSavePreferences() {
    toast.success('Preferencias guardadas')
    if (window.matchMedia('(min-width: 768px)').matches) {
      navigate('/perfil')
      return
    }
    handleBack()
  }

  const updateCompactTitle = useCallback(() => {
    const headerEl = compactHeaderRef.current
    const titleEl = heroTitleRef.current
    if (!headerEl || !titleEl) return

    const headerBottom = headerEl.getBoundingClientRect().bottom
    const titleTop = titleEl.getBoundingClientRect().top
    setShowCompactTitle(titleTop <= headerBottom - COMPACT_TITLE_TOUCH_OFFSET)
  }, [])

  function handleScroll() {
    updateCompactTitle()
  }

  useEffect(() => {
    updateCompactTitle()

    function handleResize() {
      updateCompactTitle()
    }

    window.addEventListener('scroll', updateCompactTitle, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', updateCompactTitle)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateCompactTitle])

  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const rowHoverCls = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/50'
  const iconWrapCls = isDark
    ? 'rounded-lg bg-white/5 p-2 text-slate-400'
    : 'rounded-lg bg-slate-50 p-2 text-slate-400'
  const labelCls = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const badgeCls = isDark
    ? 'rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-400'
    : 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500'

  if (authLoading) {
    return (
      <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
        <DesktopNavbar />
        <div className="flex flex-1 items-center justify-center">
          <p className={`text-sm ${mutedCls}`}>Cargando…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <GuestPreferenceWall
        isDark={isDark}
        title="Tus sectores favoritos"
        subtitle="Inicia sesión para elegir qué sectores quieres ver en el carrusel del inicio."
      />
    )
  }

  return (
    <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
      <DesktopNavbar />
      <MotionDiv
        className={`fixed inset-0 z-40 flex flex-col overflow-hidden md:static md:z-auto md:min-h-0 md:flex-1 md:overflow-visible ${pageCls}`}
        initial={slideFromRight ? { x: '100%' } : false}
        animate={{ x: slideOut ? '100%' : 0 }}
        transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        <header
          ref={compactHeaderRef}
          className={`absolute inset-x-0 top-0 z-10 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors md:hidden ${
            isDark ? 'bg-[#121212]/95' : 'bg-white/95'
          }`}
        >
          <div className="grid grid-cols-[44px_1fr_44px] items-center">
            <button
              type="button"
              onClick={handleBack}
              className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
                isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
              }`}
              aria-label="Volver"
            >
              <ArrowLeft className="h-6 w-6" strokeWidth={2} />
            </button>

            <h2
              className={`m-0 text-center text-sm font-bold transition-all duration-200 ${
                showCompactTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              Sectores favoritos
            </h2>

            <div className="h-11 w-11" aria-hidden />
          </div>
        </header>

        <main
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:flex-none md:overflow-visible md:pb-8 md:pt-6"
          onScroll={handleScroll}
        >
          <PreferenceSettingsPanel
            isDark={isDark}
            title="Sectores favoritos"
            subtitle="Activa o desactiva cada sector para mostrarlo u ocultarlo en el carrusel del inicio."
            heroTitleRef={heroTitleRef}
            onSave={handleSavePreferences}
          >
            {selectableSectors.map((sector) => {
              const enabled = visibleById[sector.id] !== false
              const zoneBadge = getSectorZoneBadge(sector.id)

              return (
                <li
                  key={sector.id}
                  className={`flex items-center justify-between gap-3 p-4 transition-all ${rowHoverCls}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={`shrink-0 ${iconWrapCls}`} aria-hidden>
                      <MapPin className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <span className={`truncate text-base font-medium ${labelCls}`}>{sector.label}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className={badgeCls}>{zoneBadge}</span>
                    <PreferenceVisibilitySwitch
                      enabled={enabled}
                      isDark={isDark}
                      label={`Mostrar ${sector.label} en el inicio`}
                      onToggle={() => setSectorVisible(sector.id, !enabled)}
                    />
                  </div>
                </li>
              )
            })}
          </PreferenceSettingsPanel>
        </main>
      </MotionDiv>
    </div>
  )
}

export default FavoriteSectorsPage

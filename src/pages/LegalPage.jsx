import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BottomNav, DesktopNavbar, Footer } from '../components/layout'
import { getLegalSheetBody } from '../components/legal/legalSheetContent.js'
import { getLegalTypeFromSlug } from '../lib/legalLinks.js'
import { useTheme } from '../contexts/ThemeContext.jsx'

const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
const COMPACT_TITLE_TOUCH_OFFSET = 10

/**
 * @param {number} index
 * @returns {string}
 */
function sectionEnumeration(index) {
  return ROMAN_UPPER[index] ?? String(index + 1)
}

export function LegalPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const compactHeaderRef = useRef(null)
  const heroTitleRef = useRef(null)

  const legalType = useMemo(() => getLegalTypeFromSlug(slug), [slug])
  const meta = useMemo(() => (legalType ? getLegalSheetBody(legalType) : null), [legalType])

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const mutedCls = isDark ? 'text-[#cfcfcf]' : 'text-gray-700'

  const updateCompactTitle = useCallback(() => {
    const headerEl = compactHeaderRef.current
    const titleEl = heroTitleRef.current
    if (!headerEl || !titleEl) return

    const headerBottom = headerEl.getBoundingClientRect().bottom
    const titleTop = titleEl.getBoundingClientRect().top
    setShowCompactTitle(titleTop <= headerBottom - COMPACT_TITLE_TOUCH_OFFSET)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
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
  }, [slug, meta?.title, updateCompactTitle])

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/perfil')
  }

  if (!meta) {
    return (
      <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
        <DesktopNavbar />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
          <p className="text-lg font-bold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
            Documento legal no encontrado
          </p>
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="mt-3 text-left text-sm font-semibold text-[#14b8a6] hover:underline"
          >
            Volver al perfil
          </button>
        </main>
        <BottomNav activeTab="profile" onTabChange={() => {}} />
      </div>
    )
  }

  return (
    <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
      <DesktopNavbar />

      <header
        ref={compactHeaderRef}
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors md:hidden ${
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
            className={`m-0 truncate text-center text-sm font-bold transition-all duration-200 ${
              showCompactTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            {meta.title}
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-6">
        <section className="pb-4">
          <h1
            ref={heroTitleRef}
            className="m-0 text-2xl font-bold tracking-tight md:text-3xl"
            style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
          >
            {meta.title}
          </h1>
        </section>

        <section className="flex-1 pb-6 md:pb-8">
          <div className={`space-y-6 text-sm leading-relaxed ${mutedCls}`}>
            {meta.blocks.map((block, index) => (
              <section key={`${block.heading}-${index}`}>
                <h2
                  className={`mb-2 text-xs font-bold uppercase tracking-wide ${
                    isDark ? '!text-gray-100' : '!text-gray-900'
                  }`}
                >
                  {sectionEnumeration(index)}. {block.heading.toUpperCase()}
                </h2>
                {block.paragraphs.map((p, i) => (
                  <p key={i} className="mb-2 whitespace-pre-wrap last:mb-0">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav activeTab="profile" onTabChange={() => {}} />
    </div>
  )
}

export default LegalPage

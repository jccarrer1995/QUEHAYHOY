import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { getLegalSheetBody } from '../components/legal/legalSheetContent.js'
import { Footer } from '../components/layout/Footer.jsx'
import { getLegalTypeFromSlug } from '../lib/legalLinks.js'

const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function sectionEnumeration(index) {
  return ROMAN_UPPER[index] ?? String(index + 1)
}

export function LegalPage() {
  const { slug } = useParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const legalType = useMemo(() => getLegalTypeFromSlug(slug), [slug])
  const meta = useMemo(() => (legalType ? getLegalSheetBody(legalType) : null), [legalType])

  if (!meta) {
    return (
      <main className={`min-h-screen px-4 py-8 ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
        <div className="mx-auto max-w-4xl">
          <p className="text-lg font-bold">Documento legal no encontrado</p>
          <Link to="/" className="mt-3 inline-block text-[#14b8a6] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex flex-col ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
      <section className={`border-b ${isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'}`}>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link
            to="/"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-gray-900 hover:bg-black/10'
            }`}
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight" style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}>
            {meta.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className={`space-y-6 text-sm leading-relaxed ${isDark ? 'text-[#cfcfcf]' : 'text-gray-700'}`}>
          {meta.blocks.map((block, index) => (
            <section key={`${block.heading}-${index}`}>
              <h2 className={`mb-2 text-xs font-bold uppercase tracking-wide ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
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

      <Footer />
    </main>
  )
}

export default LegalPage

import { Link } from 'react-router-dom'
import { Users, Eye, SlidersHorizontal, Headphones, ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

const BENEFITS = [
  {
    icon: Users,
    title: 'Aumento de clientes',
    desc: 'Tu evento llega a miles de personas que buscan planes en la ciudad.',
  },
  {
    icon: Eye,
    title: 'Visualización de eventos',
    desc: 'Destaca en home, colecciones y búsqueda con buena presencia visual.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Administración autónoma',
    desc: 'Crea, edita y controla la visibilidad de tus eventos cuando quieras.',
  },
  {
    icon: Headphones,
    title: 'Soporte',
    desc: 'Acompañamiento para que publicar sea rápido y sin fricción.',
  },
]

export function OrganizadorBenefitsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const legalCls = isDark ? 'text-gray-500' : 'text-gray-500'
  const headerTitleStyle = { color: isDark ? '#E0E0E0' : '#0a0a0a' }
  const h1Style = { color: isDark ? '#E0E0E0' : '#0a0a0a' }
  const iconBox = isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800'

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <header
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <Link
            to="/"
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </Link>

          <h2 className="m-0 text-center text-sm font-bold" style={headerTitleStyle}>
            Organizadores
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pb-28 pt-[calc(env(safe-area-inset-top)+3.75rem)]">
        <h2 className="m-0 text-2xl font-bold tracking-tight" style={h1Style}>
          Haz crecer tus eventos
        </h2>
        <p className="mt-2 text-lg">
          <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>1 mes gratis</span>
          <span className={mutedCls}> · luego planes flexibles</span>
        </p>

        <ul className="mt-10 space-y-6">
          {BENEFITS.map((row) => {
            const Icon = row.icon
            return (
              <li key={row.title} className="flex gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBox}`}
                  aria-hidden
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="m-0 text-base font-semibold" style={h1Style}>
                    {row.title}
                  </h3>
                  <p className={`mt-1 text-sm leading-relaxed ${mutedCls}`}>{row.desc}</p>
                </div>
              </li>
            )
          })}
        </ul>

        <p className={`mt-10 text-center text-xs leading-relaxed ${legalCls}`}>
          Al continuar aceptas las condiciones del servicio para organizadores. El cobro se activará tras el
          periodo de prueba según el plan elegido.
        </p>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${
          isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'
        } backdrop-blur-sm`}
      >
        <Link
          to="/onboarding-organizador/planes"
          className={`flex w-full items-center justify-center rounded-full py-4 text-base font-bold shadow-lg transition active:scale-[0.99] ${
            isDark
              ? 'bg-zinc-100 text-black hover:bg-white shadow-black/20'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-black/15'
          }`}
        >
          Continuar
        </Link>
      </div>
    </div>
  )
}

export default OrganizadorBenefitsPage

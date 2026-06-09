import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Share2, MousePointerClick, MapPinned, Eye } from 'lucide-react'
import { BottomNav, DesktopNavbar, Footer } from '../components/layout'
import { useTheme } from '../contexts/ThemeContext.jsx'

const METRIC_ITEMS = [
  { id: 'views', label: 'Vistas de publicaciones', value: '12,840', icon: Eye },
  { id: 'shares', label: 'Clicks en compartir', value: '1,276', icon: Share2 },
  { id: 'map', label: 'Clicks en ver mapa', value: '2,403', icon: MapPinned },
  { id: 'cta', label: 'Clicks de interacción', value: '3,091', icon: MousePointerClick },
]

export function OrganizerMetricsPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const cardCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <div className={`flex min-h-[100dvh] flex-col ${pageCls}`}>
      <DesktopNavbar />
      <header
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] md:hidden ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h2 className="m-0 text-center text-sm font-bold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
            Métricas y Rendimiento
          </h2>
          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-6">
        <section className={`rounded-2xl border p-5 ${cardCls}`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">
              <BarChart3 className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h3 className="m-0 text-lg font-bold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
                Alcance general del mes
              </h3>
              <p className={`m-0 text-sm ${mutedCls}`}>45,320 interacciones acumuladas</p>
            </div>
          </div>
          <p className={`mt-3 text-xs ${mutedCls}`}>Datos de demostración (hardcodeados), pendientes de integración real.</p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {METRIC_ITEMS.map((metric) => {
            const Icon = metric.icon
            return (
              <article key={metric.id} className={`rounded-2xl border p-4 ${cardCls}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#14b8a6]" strokeWidth={2} />
                  <p className={`m-0 text-sm ${mutedCls}`}>{metric.label}</p>
                </div>
                <p className="m-0 text-2xl font-extrabold tracking-tight" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
                  {metric.value}
                </p>
              </article>
            )
          })}
        </section>
      </main>

      <Footer />
      <BottomNav activeTab="profile" onTabChange={() => {}} />
    </div>
  )
}

export default OrganizerMetricsPage

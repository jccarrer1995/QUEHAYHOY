import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, CalendarClock, CreditCard, RotateCcw, XCircle } from 'lucide-react'
import { BottomNav, Footer } from '../components/layout'
import { useTheme } from '../contexts/ThemeContext.jsx'

export function SubscriptionPlanPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const cardCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <header
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] ${
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
            Mi Suscripción / Plan
          </h2>
          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col gap-4 px-4 pb-24 pt-[calc(env(safe-area-inset-top)+3.75rem)] md:pb-8 md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <section className={`rounded-2xl border p-5 ${cardCls}`}>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">
              <BadgeCheck className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h3 className="m-0 text-lg font-bold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
                Plan Pro
              </h3>
              <p className={`m-0 text-sm ${mutedCls}`}>$7.99 / mes</p>
            </div>
          </div>

          <div className={`space-y-3 text-sm ${mutedCls}`}>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#14b8a6]" strokeWidth={2} />
              Ciclo de facturación: 15 de cada mes
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#14b8a6]" strokeWidth={2} />
              Método de pago: Visa ••••3002
            </div>
          </div>
        </section>

        <section className={`rounded-2xl border p-5 ${cardCls}`}>
          <h3 className="m-0 text-base font-semibold" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
            Gestionar plan
          </h3>
          <p className={`mt-2 text-sm ${mutedCls}`}>
            Puedes cambiar de plan o cancelar cuando quieras. Estas acciones son de demostración por ahora.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14b8a6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Cambiar plan
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? 'border-red-500/40 text-red-300 hover:bg-red-500/10'
                  : 'border-red-200 text-red-700 hover:bg-red-50'
              }`}
            >
              <XCircle className="h-4 w-4" strokeWidth={2} />
              Cancelar plan
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav activeTab="profile" onTabChange={() => {}} />
    </div>
  )
}

export default SubscriptionPlanPage

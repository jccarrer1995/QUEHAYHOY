import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { ORGANIZER_PLANS, ROLE_ORGANIZADOR } from '../lib/organizerPlans.js'

export function OrganizadorPlansPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const { user, profile, upgradeToOrganizerPlan, loading: authLoading } = useAuth()
  const [selected, setSelected] = useState(/** @type {'basic' | 'pro'} */ ('pro'))
  const [busy, setBusy] = useState(false)

  const isOrganizer = (profile?.role ?? '').toLowerCase() === ROLE_ORGANIZADOR

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardMuted = isDark ? 'text-gray-400' : 'text-gray-700'
  const headerTitleStyle = { color: isDark ? '#E0E0E0' : '#0a0a0a' }

  async function handleTrial() {
    if (!user) {
      toast.message('Inicia sesión para activar tu prueba', { duration: 4000 })
      navigate('/perfil', { state: { from: '/onboarding-organizador/planes' } })
      return
    }
    if (isOrganizer) {
      navigate('/mis-eventos/crear', { replace: true })
      return
    }
    setBusy(true)
    try {
      await upgradeToOrganizerPlan(selected)
      toast.success('¡Listo! Ya puedes publicar eventos.')
      navigate('/mis-eventos/crear', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo activar el plan.'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  const basic = ORGANIZER_PLANS.basic
  const pro = ORGANIZER_PLANS.pro

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <header
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] transition-colors ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <Link
            to="/onboarding-organizador"
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </Link>

          <h2 className="m-0 text-center text-sm font-bold" style={headerTitleStyle}>
            Elige tu plan
          </h2>

          <div className="h-11 w-11" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pb-36 pt-[calc(env(safe-area-inset-top)+3.75rem)]">
        <p className={`text-center text-sm ${mutedCls}`}>
          Incluye{' '}
          <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>1 mes gratis</span>{' '}
          en ambos planes
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setSelected('basic')}
            className={`relative w-full rounded-2xl border p-4 text-left transition ${
              selected === 'basic'
                ? 'border-teal-500/80 bg-teal-500/10 ring-1 ring-teal-500/40'
                : isDark
                  ? 'border-gray-800 bg-[#161616] hover:border-gray-700'
                  : 'border-gray-200 bg-gray-50 shadow-sm hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 font-semibold" style={headerTitleStyle}>
                  {basic.label}
                </p>
                <p className={`mt-1 text-sm ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  {basic.trialMonths} mes gratis · luego USD {basic.priceUsd.toFixed(2)}/mes
                </p>
                <p className={`mt-2 text-sm ${cardMuted}`}>
                  Hasta {basic.maxEventsPerMonth} eventos activos por mes
                </p>
              </div>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected === 'basic' ? 'border-teal-400 bg-teal-500' : isDark ? 'border-gray-600' : 'border-gray-400'
                }`}
              >
                {selected === 'basic' ? <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} /> : null}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected('pro')}
            className={`relative w-full rounded-2xl border p-4 text-left transition ${
              selected === 'pro'
                ? 'border-teal-500/80 bg-teal-500/10 ring-1 ring-teal-500/40'
                : isDark
                  ? 'border-gray-800 bg-[#161616] hover:border-gray-700'
                  : 'border-gray-200 bg-gray-50 shadow-sm hover:border-gray-300'
            }`}
          >
            <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
              Mejor valor
            </span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 font-semibold" style={headerTitleStyle}>
                  {pro.label}
                </p>
                <p className={`mt-1 text-sm ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                  {pro.trialMonths} mes gratis · luego USD {pro.priceUsd.toFixed(2)}/mes
                </p>
                <p className={`mt-2 text-sm ${cardMuted}`}>
                  Hasta {pro.maxEventsPerMonth} eventos activos por mes
                </p>
              </div>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected === 'pro' ? 'border-teal-400 bg-teal-500' : isDark ? 'border-gray-600' : 'border-gray-400'
                }`}
              >
                {selected === 'pro' ? <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} /> : null}
              </span>
            </div>
          </button>
        </div>

        <p className={`mt-8 text-center text-xs leading-relaxed ${mutedCls}`}>
          La activación del rol organizador es inmediata. Integración de pagos y facturación pueden añadirse
          después desde tu cuenta.
        </p>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${
          isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'
        } backdrop-blur-sm`}
      >
        <button
          type="button"
          disabled={busy || authLoading}
          onClick={handleTrial}
          className={`flex w-full items-center justify-center rounded-2xl py-4 text-base font-bold shadow-inner transition disabled:opacity-50 ${
            isDark
              ? 'bg-zinc-100 text-black hover:bg-white'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {busy ? 'Activando…' : 'Prueba sin costo'}
        </button>
      </div>
    </div>
  )
}

export default OrganizadorPlansPage

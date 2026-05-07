import { Link } from 'react-router-dom'
import { Award, Check, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { ORGANIZER_PLANS } from '../../lib/organizerPlans.js'

/** Pill CTA: texto e ícono centrados en eje vertical */
function BannerCta({ children, className }) {
  return (
    <span
      className={`mt-0.5 inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full px-3 text-xs font-bold leading-none transition [&>svg]:shrink-0 ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * Tarjeta del banner organizador (copy a la izquierda, 🎟️ a la derecha en sm+).
 * @param {{ isDark: boolean }} props
 */
export function OrganizerPromoBannerCard({ isDark }) {
  const cardBorder = isDark ? 'border-zinc-800' : 'border-zinc-200/80'
  const cardGradient = isDark
    ? 'from-zinc-900 via-zinc-900 to-zinc-900'
    : 'from-amber-50 via-white to-white'
  const textMain = isDark ? 'text-white' : 'text-zinc-900'
  const textSub = isDark ? 'text-zinc-400' : 'text-zinc-600'
  const ctaCls = isDark
    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
    : 'bg-zinc-900 text-white hover:bg-zinc-800'

  return (
    <Link
      to="/onboarding-organizador"
      className={`group relative flex h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border shadow-md shadow-black/5 transition hover:shadow-lg dark:shadow-black/30 ${cardBorder}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cardGradient}`}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[88px] min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-2.5 sm:min-h-[96px] sm:max-w-[62%] sm:px-3.5 sm:py-3">
        <p className={`m-0 text-sm font-bold leading-tight tracking-tight sm:text-base ${textMain}`}>
          Subir eventos{' '}
          <span className="text-amber-500 dark:text-amber-400">sin costo</span>
        </p>
        <p className={`m-0 text-xs leading-snug ${textSub}`}>
          Obtén <span className="font-semibold text-amber-800">más visibilidad</span> en tu negocio.
        </p>
        <p className={`m-0 text-xs leading-snug ${textSub}`}>Aumenta ventas / Genera ingresos</p>
        <BannerCta className={ctaCls}>
          Empezar
          <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
        </BannerCta>
      </div>
      <div
        className="relative z-10 hidden min-w-[34%] items-center justify-center border-l border-black/[0.06] dark:border-white/[0.08] sm:flex"
        aria-hidden
      >
        <span className="text-3xl drop-shadow-md">🎟️</span>
      </div>
    </Link>
  )
}

/**
 * Banner de plan (Estándar / Pro), mismo layout horizontal que la promo principal.
 * @param {{ isDark: boolean, planId: 'basic' | 'pro' }} props
 */
export function OrganizerPlanBannerCard({ isDark, planId }) {
  const plan = ORGANIZER_PLANS[planId]
  if (!plan) return null

  const isPro = planId === 'pro'
  const textMain = isDark ? 'text-white' : 'text-zinc-900'
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600'
  const priceAccent = isDark ? 'text-amber-400' : 'text-amber-800'

  const cardBorder = isPro
    ? isDark
      ? 'border-zinc-700'
      : 'border-zinc-200/90'
    : isDark
      ? 'border-teal-500/35'
      : 'border-teal-200/90'

  const cardGradient = isPro
    ? isDark
      ? 'from-zinc-900 via-zinc-900 to-zinc-950'
      : 'from-zinc-50 via-white to-amber-50/40'
    : isDark
      ? 'from-teal-950/80 via-zinc-900 to-zinc-900'
      : 'from-teal-50 via-white to-teal-100/70'

  const ctaCls = isDark
    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
    : 'bg-zinc-900 text-white hover:bg-zinc-800'

  return (
    <Link
      to={`/onboarding-organizador/planes?plan=${planId}`}
      className={`group relative flex h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border shadow-md shadow-black/5 transition hover:shadow-lg dark:shadow-black/30 ${cardBorder}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cardGradient}`}
        aria-hidden
      />

      {isPro ? (
        <span className="absolute right-2 top-2 z-20 rounded-full bg-amber-500 px-1.5 py-px text-[9px] font-bold uppercase leading-none tracking-wide text-black sm:right-2.5 sm:top-2.5">
          Mejor valor
        </span>
      ) : null}

      <div className="relative z-10 flex min-h-[88px] min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2.5 sm:min-h-[96px] sm:max-w-[62%] sm:px-3.5 sm:py-3">
        <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-teal-500">
          Plan
        </span>
        <p className={`text-sm font-bold leading-tight sm:text-base ${textMain}`}>{plan.label}</p>
        <p className="text-xs leading-snug">
          <span className={`font-semibold ${priceAccent}`}>1 mes gratis</span>
          <span className={muted}> · USD {plan.priceUsd.toFixed(2)}/mes</span>
        </p>
        <p className={`text-xs leading-snug ${muted}`}>Hasta {plan.maxEventsPerMonth} eventos / mes</p>
        <BannerCta className={ctaCls}>
          Elegir
          <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
        </BannerCta>
      </div>

      <div
        className="relative z-10 hidden min-w-[34%] items-center justify-center border-l border-black/[0.06] dark:border-white/[0.08] sm:flex"
        aria-hidden
      >
        {isPro ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-500/50 bg-amber-500/20 dark:bg-amber-500/10">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
          </span>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm shadow-teal-900/25">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </span>
        )}
      </div>
    </Link>
  )
}

/**
 * Banner de conversión a organizador.
 * Solo para usuarios con sesión iniciada y rol «Asistente» (no invitados ni ya organizadores).
 * Tres columnas: promo general, plan Estándar, plan Pro.
 */
export function OrganizerPromoBanner({ isDark }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null
  if (!user) return null

  const roleNorm = (profile?.role ?? '').trim().toLowerCase()
  if (roleNorm !== 'asistente') return null

  return (
    <section className="mt-5 mb-6" aria-label="Promoción organizadores">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-stretch md:gap-3">
        <OrganizerPromoBannerCard isDark={isDark} />
        <OrganizerPlanBannerCard isDark={isDark} planId="basic" />
        <OrganizerPlanBannerCard isDark={isDark} planId="pro" />
      </div>
    </section>
  )
}

/**
 * Bottom sheet: pedir inicio de sesión antes de guardar favoritos (guest).
 */
import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useProfileGoogleSignIn } from './useProfileGoogleSignIn.js'

const MotionDiv = motion.div
const CLOSE_OFFSET_PX = 96
const CLOSE_VELOCITY = 420

/** Logo Google (marca) */
function GoogleLogo({ className = 'h-7 w-7 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/**
 * @param {{
 *   open: boolean
 *   onClose: () => void
 *   title?: string
 *   subtitle?: string
 *   ctaLabel?: string
 * }} props
 */
export function FavoriteLoginSheet({
  open,
  onClose,
  title = '¡Casi listo!',
  subtitle = 'Para guardar este evento necesitas una cuenta.',
  ctaLabel = 'Iniciar sesión con Google',
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const dragControls = useDragControls()
  const { signInWithGoogle, beginGoogleRedirect } = useAuth()
  const { handleGoogleClick, googleBusy } = useProfileGoogleSignIn({ signInWithGoogle, beginGoogleRedirect })

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function startDrag(e) {
    dragControls.start(e)
  }

  const pageBg = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'
  const handleCls = isDark ? 'bg-gray-500/50' : 'bg-gray-400/60'
  const closeHoverCls = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'

  const googleBtnCls = isDark
    ? 'bg-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/25 hover:bg-[#0d9488]'
    : 'bg-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/30 hover:bg-[#0d9488]'

  const modal = (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          key="favorite-login-sheet"
          className="fixed inset-0 z-[135] flex items-end justify-center sm:items-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="favorite-login-sheet-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar"
            onClick={requestClose}
          />

          <MotionDiv
            className={`relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl shadow-2xl sm:max-w-md ${pageBg}`}
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY) {
                requestClose()
              }
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-3 pb-1 active:cursor-grabbing"
              onPointerDown={startDrag}
            >
              <div className={`h-1.5 w-12 rounded-full ${handleCls}`} aria-hidden />
            </div>

            <div
              className={`flex shrink-0 items-center justify-end border-b px-3 pb-2 pt-0 ${borderCls}`}
              onPointerDown={startDrag}
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={requestClose}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${closeHoverCls} ${
                  isDark ? '!text-gray-300' : '!text-gray-800'
                }`}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="px-6 pb-2 pt-2 text-center">
              <h2
                id="favorite-login-sheet-title"
                className={`text-xl font-bold leading-snug ${isDark ? '!text-[#E0E0E0]' : '!text-gray-900'}`}
              >
                {title}
              </h2>
              <p className={`mt-3 text-sm leading-relaxed ${mutedCls}`}>{subtitle}</p>

              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleBusy}
                className={`mt-6 flex w-full items-center justify-center gap-3 rounded-2xl py-4 pl-5 pr-6 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${googleBtnCls}`}
              >
                <GoogleLogo className="h-7 w-7 shrink-0" />
                {googleBusy ? 'Conectando…' : ctaLabel}
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}

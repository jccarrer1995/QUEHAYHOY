import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const MotionDiv = motion.div

/**
 * @param {{
 *   open: boolean
 *   onClose: () => void
 *   onConfirm: () => void
 *   deleting?: boolean
 *   isDark?: boolean
 * }} props
 */
export function DeleteAccountConfirmDialog({
  open,
  onClose,
  onConfirm,
  deleting = false,
  isDark = false,
}) {
  const requestClose = useCallback(() => {
    if (!deleting) onClose()
  }, [deleting, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, requestClose])

  const panelCls = isDark ? 'bg-[#1a1a1a] text-[#E0E0E0] border-gray-700' : 'bg-white text-gray-900 border-gray-200'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const cancelCls = isDark
    ? 'border-gray-600 bg-[#252525] text-[#E0E0E0] hover:bg-[#2e2e2e]'
    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'

  const modal = (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          key="delete-account-dialog"
          className="fixed inset-0 z-[140] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Cerrar"
            onClick={requestClose}
            disabled={deleting}
          />

          <MotionDiv
            className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl ${panelCls}`}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          >
            <h2
              id="delete-account-dialog-title"
              className="m-0 text-lg font-bold leading-snug"
              style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
            >
              ¿Estás seguro?
            </h2>
            <p className={`mt-4 text-sm leading-relaxed ${mutedCls}`}>
              Esta acción borrará tus eventos guardados y no se puede deshacer. Tu cuenta y datos
              personales se eliminarán de forma permanente.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={requestClose}
                disabled={deleting}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60 sm:w-auto ${cancelCls}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar cuenta'}
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

export default DeleteAccountConfirmDialog

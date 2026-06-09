import { useEffect, useId, useRef, useState } from 'react'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Menú de acciones (editar / eliminar) para filas de listado de Mis Eventos.
 * Un solo botón de tres puntos, estilo alineado con FavoriteToggleButton inline.
 *
 * @param {{
 *   onEdit: () => void
 *   onDelete: () => void
 *   editDisabled?: boolean
 *   deleteDisabled?: boolean
 *   editDisabledMessage?: string
 *   deleteDisabledMessage?: string
 *   isDark?: boolean
 * }} props
 */
export function OrganizerEventListMenu({
  onEdit,
  onDelete,
  editDisabled = false,
  deleteDisabled = false,
  editDisabledMessage,
  deleteDisabledMessage,
  isDark = false,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(e) {
      if (!rootRef.current?.contains(e.target instanceof Node ? e.target : null)) {
        setOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function stopPropagation(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function toggleMenu(e) {
    stopPropagation(e)
    setOpen((prev) => !prev)
  }

  /**
   * @param {() => void} action
   * @param {boolean} disabled
   * @param {string | undefined} disabledMessage
   */
  function runAction(action, disabled, disabledMessage) {
    return (e) => {
      stopPropagation(e)
      if (disabled) {
        if (disabledMessage) {
          toast.message(disabledMessage, { duration: 4500 })
        }
        return
      }
      setOpen(false)
      action()
    }
  }

  const triggerCls = open
    ? 'border-[#14b8a6] bg-[#14b8a6] text-white'
    : isDark
      ? 'border-gray-600 bg-[#222] text-gray-300 hover:border-[#14b8a6]/50 hover:text-[#5eead4]'
      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#14b8a6]/50 hover:text-[#14b8a6]'

  const panelCls = isDark
    ? 'border-gray-700 bg-[#1a1a1a] shadow-xl shadow-black/40'
    : 'border-gray-200 bg-white shadow-lg shadow-black/10'

  const itemBase =
    'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition'
  const itemEnabledCls = isDark
    ? 'text-[#E0E0E0] hover:bg-white/5'
    : 'text-gray-800 hover:bg-gray-50'
  const itemDisabledCls = isDark
    ? 'cursor-not-allowed text-gray-500 opacity-60'
    : 'cursor-not-allowed text-gray-400 opacity-60'

  return (
    <div
      ref={rootRef}
      className="relative z-20 shrink-0"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onKeyDown={stopPropagation}
    >
      <button
        type="button"
        onClick={toggleMenu}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors active:scale-95 ${triggerCls}`}
        aria-label="Opciones del evento"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <EllipsisVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Acciones del evento"
          className={`absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border py-1 ${panelCls}`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={runAction(onEdit, editDisabled, editDisabledMessage)}
            className={`${itemBase} ${editDisabled ? itemDisabledCls : itemEnabledCls}`}
            aria-disabled={editDisabled}
          >
            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Editar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={runAction(onDelete, deleteDisabled, deleteDisabledMessage)}
            className={`${itemBase} ${
              deleteDisabled
                ? itemDisabledCls
                : isDark
                  ? 'text-red-400 hover:bg-red-950/40'
                  : 'text-red-600 hover:bg-red-50'
            }`}
            aria-disabled={deleteDisabled}
          >
            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Eliminar
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default OrganizerEventListMenu

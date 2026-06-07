import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * @param {{
 *   icon: import('lucide-react').LucideIcon
 *   label: string
 *   onClick: () => void
 *   disabled?: boolean
 *   disabledMessage?: string
 *   variant: 'edit' | 'delete'
 * }} props
 */
function ActionButton({ icon: Icon, label, onClick, disabled = false, disabledMessage, variant }) {
  const btnBase =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition active:scale-95'

  const enabledCls =
    variant === 'delete'
      ? 'border-red-400/60 bg-red-600/90 text-white hover:bg-red-700'
      : 'border-white/55 bg-black/35 text-white hover:bg-black/50'

  const disabledCls =
    'cursor-not-allowed border-gray-400/55 bg-gray-500/75 text-gray-200 opacity-90'

  function handleClick(e) {
    e.stopPropagation()
    if (disabled) {
      if (disabledMessage) {
        toast.message(disabledMessage, { duration: 4500 })
      }
      return
    }
    onClick()
  }

  return (
    <div className="group/action relative">
      <button
        type="button"
        onClick={handleClick}
        className={`${btnBase} ${disabled ? disabledCls : enabledCls}`}
        aria-label={label}
        aria-disabled={disabled}
        title={disabled && disabledMessage ? disabledMessage : label}
      >
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      {disabled && disabledMessage ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-30 hidden w-56 rounded-lg border border-gray-700/80 bg-[#1a1a1a] px-3 py-2 text-left text-[11px] leading-snug text-gray-100 shadow-lg group-hover/action:block group-focus-within/action:block"
        >
          {disabledMessage}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Acciones de gestión en la tarjeta (editar / eliminar), sustituyen el botón de favoritos.
 *
 * @param {{
 *   onEdit: () => void
 *   onDelete: () => void
 *   editDisabled?: boolean
 *   deleteDisabled?: boolean
 *   editDisabledMessage?: string
 *   deleteDisabledMessage?: string
 * }} props
 */
export function OrganizerEventCardActions({
  onEdit,
  onDelete,
  editDisabled = false,
  deleteDisabled = false,
  editDisabledMessage,
  deleteDisabledMessage,
}) {
  function stopPropagation(e) {
    e.stopPropagation()
  }

  return (
    <div
      className="absolute right-3 top-3 z-20 flex items-center gap-2"
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      role="group"
      aria-label="Acciones del evento"
    >
      <ActionButton
        icon={Pencil}
        label="Editar evento"
        onClick={onEdit}
        disabled={editDisabled}
        disabledMessage={editDisabledMessage}
        variant="edit"
      />
      <ActionButton
        icon={Trash2}
        label="Eliminar evento"
        onClick={onDelete}
        disabled={deleteDisabled}
        disabledMessage={deleteDisabledMessage}
        variant="delete"
      />
    </div>
  )
}

export default OrganizerEventCardActions

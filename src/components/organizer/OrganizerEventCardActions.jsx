import { Pencil, Trash2 } from 'lucide-react'

/**
 * Acciones de gestión en la tarjeta (editar / eliminar), sustituyen el botón de favoritos.
 *
 * @param {{
 *   onEdit: () => void
 *   onDelete: () => void
 *   deleteDisabled?: boolean
 * }} props
 */
export function OrganizerEventCardActions({ onEdit, onDelete, deleteDisabled = false }) {
  function stopPropagation(e) {
    e.stopPropagation()
  }

  const btnBase =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition active:scale-95'

  return (
    <div
      className="absolute right-3 top-3 z-20 flex items-center gap-2"
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      role="group"
      aria-label="Acciones del evento"
    >
      <button
        type="button"
        onClick={(e) => {
          stopPropagation(e)
          onEdit()
        }}
        className={`${btnBase} border-white/55 bg-black/35 text-white hover:bg-black/50`}
        aria-label="Editar evento"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stopPropagation(e)
          onDelete()
        }}
        disabled={deleteDisabled}
        className={`${btnBase} border-red-400/60 bg-red-600/90 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Eliminar evento"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}

export default OrganizerEventCardActions

import { Heart } from 'lucide-react'
import { motion, useAnimationControls } from 'framer-motion'
import { useFavoriteEvents } from '../../contexts/FavoriteEventsContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useFavoriteLoginPrompt } from '../../contexts/FavoriteLoginPromptContext.jsx'

/**
 * @param {{ eventId: string | number, className?: string, variant?: 'overlay' | 'inline' }} props
 */
export function FavoriteToggleButton({ eventId, className = '', variant = 'overlay' }) {
  const { user } = useAuth()
  const { openFavoriteLoginPrompt } = useFavoriteLoginPrompt()
  const { isFavorite, toggleFavorite } = useFavoriteEvents()
  const controls = useAnimationControls()
  const normalizedId =
    typeof eventId === 'string' || typeof eventId === 'number' ? String(eventId).trim() : ''
  if (!normalizedId) return null

  const active = Boolean(user) && isFavorite(normalizedId)

  async function handleToggle(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      openFavoriteLoginPrompt()
      return
    }

    toggleFavorite(normalizedId)
    await controls.start({
      scale: [1, 1.18, 0.96, 1],
      transition: { duration: 0.24, ease: 'easeOut' },
    })
  }

  function stopPropagation(e) {
    e.stopPropagation()
  }

  const overlayCls =
    'absolute right-3 top-3 z-20 h-10 w-10 border shadow-sm backdrop-blur-sm ' +
    (active
      ? 'border-[#14b8a6] bg-[#14b8a6] text-white'
      : 'border-white/55 bg-black/35 text-white hover:bg-black/45')

  const inlineCls =
    'relative z-20 h-9 w-9 shrink-0 ' +
    (active
      ? 'border-[#14b8a6] bg-[#14b8a6] text-white'
      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#14b8a6]/50 hover:text-[#14b8a6] dark:border-gray-600 dark:bg-[#222] dark:text-gray-300 dark:hover:text-[#5eead4]')

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      onMouseDown={stopPropagation}
      onKeyDown={stopPropagation}
      animate={controls}
      whileTap={{ scale: 0.92 }}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-full border transition-colors ${
        variant === 'inline' ? inlineCls : overlayCls
      } ${className}`}
    >
      <Heart
        className={`${variant === 'inline' ? 'h-4 w-4' : 'h-5 w-5'}`}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </motion.button>
  )
}

export default FavoriteToggleButton

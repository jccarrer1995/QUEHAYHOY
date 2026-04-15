import { Heart } from 'lucide-react'
import { motion, useAnimationControls } from 'framer-motion'
import { useFavoriteEvents } from '../../contexts/FavoriteEventsContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useFavoriteLoginPrompt } from '../../contexts/FavoriteLoginPromptContext.jsx'

export function FavoriteToggleButton({ eventId, className = '' }) {
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
      className={`absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
        active
          ? 'border-[#14b8a6] bg-[#14b8a6] text-white'
          : 'border-white/55 bg-black/35 text-white hover:bg-black/45'
      } ${className}`}
    >
      <Heart className="h-5 w-5" fill={active ? 'currentColor' : 'none'} strokeWidth={2} />
    </motion.button>
  )
}

export default FavoriteToggleButton

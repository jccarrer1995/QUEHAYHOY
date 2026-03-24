import { useState } from 'react'

/**
 * Imagen circular del sector; si la URL externa falla, muestra el mismo placeholder que «Todo».
 * @param {{ src: string, label: string, isDark: boolean }} props
 */
export function SectorRoundImage({ src, label, isDark }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span
        className={`flex h-full w-full items-center justify-center text-lg ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        ✨
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={label}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

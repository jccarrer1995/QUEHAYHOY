/**
 * Skeleton de carga para EventDetailPage — mobile-first, mismo layout aproximado
 */
export function EventDetailPageSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-[#121212]' : 'bg-white'
  const skeleton = isDark ? 'bg-gray-700' : 'bg-gray-200'
  const panel = isDark ? 'bg-[#161616]' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${bg} animate-pulse`} aria-busy="true" aria-label="Cargando evento">
      <div className={`h-[42vh] min-h-[220px] w-full ${skeleton}`} />

      <div className={`relative z-10 -mt-6 rounded-t-3xl px-4 pb-28 pt-6 ${panel}`}>
        <div className={`mb-3 h-6 w-24 rounded-full ${skeleton}`} />
        <div className={`mb-4 h-10 w-full max-w-md rounded-xl ${skeleton}`} />
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${skeleton}`} />
            <div className={`h-4 flex-1 rounded ${skeleton}`} />
          </div>
          <div className="flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${skeleton}`} />
            <div className={`h-4 flex-1 rounded ${skeleton}`} />
          </div>
          <div className="flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${skeleton}`} />
            <div className={`h-4 flex-1 rounded ${skeleton}`} />
          </div>
        </div>
        <div className={`mt-6 h-24 w-full rounded-2xl ${skeleton}`} />
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-20 border-t px-4 py-3 ${isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'} backdrop-blur`}
      >
        <div className={`mx-auto max-w-lg h-12 rounded-2xl ${skeleton}`} />
      </div>
    </div>
  )
}

export default EventDetailPageSkeleton

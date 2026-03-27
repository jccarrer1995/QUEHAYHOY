import { PromoSquare } from './PromoSquare'

const SPECIAL_COLLECTIONS = [
  {
    id: 'dia-del-nino',
    title: 'Dia del Nino (1 Jun) 🍭',
    badge: 'ESPECIAL',
    imageUrl:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'feriado-batalla',
    title: 'Feriado Batalla de Pichincha 🇪🇨',
    badge: 'FERIADO',
    imageUrl:
      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'ruta-gastronomica',
    title: 'Ruta Gastronomica 🍤',
    badge: 'ESPECIAL',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
  },
]

/**
 * @param {{ isDark?: boolean }} props
 */
export function SpecialCollections({ isDark = false }) {
  return (
    <section className={`mt-0.5 pt-3 mb-5 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
      <div className="mb-3">
        <h2
          className="text-lg font-extrabold"
          style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
        >
          Colecciones Especiales
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {SPECIAL_COLLECTIONS.map((item) => (
          <PromoSquare
            key={item.id}
            title={item.title}
            badge={item.badge}
            imageUrl={item.imageUrl}
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  )
}

export default SpecialCollections

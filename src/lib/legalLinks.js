/** @typedef {'terms' | 'privacy' | 'about'} LegalPageType */

export const LEGAL_LINKS = [
  {
    type: 'terms',
    label: 'Términos y Condiciones',
    path: '/legal/terminos-y-condiciones',
  },
  {
    type: 'privacy',
    label: 'Política de Privacidad',
    path: '/legal/politica-de-privacidad',
  },
  {
    type: 'about',
    label: 'Acerca de la App',
    path: '/legal/acerca-de-la-app',
  },
]

/**
 * @param {string | undefined} slug
 * @returns {LegalPageType | null}
 */
export function getLegalTypeFromSlug(slug) {
  const found = LEGAL_LINKS.find((item) => item.path.endsWith(`/${slug ?? ''}`))
  return found?.type ?? null
}

/**
 * @param {LegalPageType} type
 * @returns {string}
 */
export function getLegalPathByType(type) {
  const found = LEGAL_LINKS.find((item) => item.type === type)
  return found?.path ?? '/legal/terminos-y-condiciones'
}

/**
 * Planes de suscripción para organizadores (referencia de negocio; cobro vía pasarela en el futuro).
 * @typedef {{ id: string, label: string, maxEventsPerMonth: number, priceUsd: number, trialMonths: number }} OrganizerPlanDefinition
 */

/** @type {Record<string, OrganizerPlanDefinition>} */
export const ORGANIZER_PLANS = {
  basic: {
    id: 'basic',
    label: 'Estándar',
    maxEventsPerMonth: 6,
    priceUsd: 4.99,
    trialMonths: 1,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    maxEventsPerMonth: 15,
    priceUsd: 7.99,
    trialMonths: 1,
  },
}

/**
 * @param {string} planId
 * @returns {OrganizerPlanDefinition | null}
 */
export function getOrganizerPlan(planId) {
  const p = ORGANIZER_PLANS[planId]
  return p ?? null
}

/** Rol en Firestore: publica eventos con cuota y solo ve los suyos */
export const ROLE_ORGANIZADOR = 'organizador'

/** Rol en Firestore: Super Admin — ve y gestiona toda la plataforma */
export const ROLE_ADMINISTRADOR = 'Admin'

/**
 * @param {string | null | undefined} roleRaw
 * @returns {boolean}
 */
export function isAdministratorRole(roleRaw) {
  const r = (roleRaw ?? '').trim().toLowerCase()
  return r === 'admin' || r === 'administrador'
}

/**
 * Puede acceder a `/wp-admin`, crear/editar eventos y ver «Mis eventos».
 * @param {string | null | undefined} roleRaw
 * @returns {boolean}
 */
export function canManageEventsRole(roleRaw) {
  const r = (roleRaw ?? '').trim().toLowerCase()
  return r === ROLE_ORGANIZADOR || isAdministratorRole(roleRaw)
}

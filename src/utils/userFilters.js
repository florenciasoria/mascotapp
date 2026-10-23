import { ROLES, STATUS, STATUS_LABELS } from './roles'
import { normalizeText } from './text'

// Filtros de Gestionar usuarios. Un valor vacío significa "todos".
export const EMPTY_USER_FILTERS = {
  search: '',
  role: '',
  status: '',
}

/**
 * Usuarios que cumplen todos los filtros (la búsqueda ignora mayúsculas y tildes).
 * @param {object[]} users
 * @param {object} filters
 * @returns {object[]}
 */
export function filterUsers(users, filters) {
  const search = normalizeText(filters.search.trim())

  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false
    if (filters.status && user.status !== filters.status) return false
    if (search && !normalizeText(`${user.name} ${user.email}`).includes(search)) return false
    return true
  })
}

/**
 * Estados posibles según el rol (solo los refugios pueden estar pendientes o rechazados).
 * @param {string} role - Rol, o "" para todos.
 * @returns {{value: string, label: string}[]}
 */
export function getStatusOptions(role) {
  const statuses =
    role === '' || role === ROLES.SHELTER
      ? Object.keys(STATUS_LABELS)
      : [STATUS.APPROVED, STATUS.INACTIVE]

  return [
    { value: '', label: 'Todos' },
    ...statuses.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  ]
}

/**
 * Ubica primero las cuentas pendientes; el resto mantiene su orden.
 * @param {object[]} users
 * @returns {object[]} Una copia ordenada.
 */
export function sortPendingFirst(users) {
  return [...users].sort(
    (a, b) => Number(b.status === STATUS.PENDING) - Number(a.status === STATUS.PENDING),
  )
}

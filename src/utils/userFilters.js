import { ROLES, STATUS, STATUS_LABELS } from './roles'
import { normalizeText } from './text'

// Filtros de "Gestionar usuarios". Un filtro vacío ('') significa "todos".
export const EMPTY_USER_FILTERS = {
  search: '',
  role: '',
  status: '',
}

// Devuelve los usuarios que cumplen todos los filtros elegidos
export function filterUsers(users, filters) {
  const search = normalizeText(filters.search.trim())

  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false
    if (filters.status && user.status !== filters.status) return false
    if (search && !normalizeText(`${user.name} ${user.email}`).includes(search)) return false
    return true
  })
}

// Estados posibles según el rol: solo los refugios pueden estar pendientes o rechazados
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

// Los pendientes primero (son los que requieren acción del admin).
// El orden es "estable": dentro de cada grupo se mantiene del más nuevo al más viejo.
export function sortPendingFirst(users) {
  return [...users].sort(
    (a, b) => Number(b.status === STATUS.PENDING) - Number(a.status === STATUS.PENDING),
  )
}

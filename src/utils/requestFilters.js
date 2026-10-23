import { REQUEST_STATUS, REQUEST_STATUS_LABELS } from './requestOptions'

// Opciones del filtro por estado, generadas desde REQUEST_STATUS
export const REQUEST_STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  ...Object.values(REQUEST_STATUS).map((status) => ({
    value: status,
    label: REQUEST_STATUS_LABELS[status],
  })),
]

/**
 * Filtra solicitudes por estado.
 * @param {object[]} requests
 * @param {string} status - Estado, o "" para todas.
 * @returns {object[]}
 */
export function filterRequestsByStatus(requests, status) {
  return status ? requests.filter((request) => request.status === status) : requests
}

/**
 * Ubica primero las pendientes; el resto mantiene su orden.
 * @param {object[]} requests
 * @returns {object[]} Una copia ordenada.
 */
export function sortRequestsPendingFirst(requests) {
  return [...requests].sort(
    (a, b) =>
      Number(b.status === REQUEST_STATUS.PENDING) - Number(a.status === REQUEST_STATUS.PENDING),
  )
}

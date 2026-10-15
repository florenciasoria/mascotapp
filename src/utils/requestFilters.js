import { REQUEST_STATUS, REQUEST_STATUS_LABELS } from './requestOptions'

// Opciones del filtro por estado. Se arman desde REQUEST_STATUS:
// si se agrega un estado nuevo, aparece solo en el filtro.
export const REQUEST_STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  ...Object.values(REQUEST_STATUS).map((status) => ({
    value: status,
    label: REQUEST_STATUS_LABELS[status],
  })),
]

// Filtra por estado ('' = todas)
export function filterRequestsByStatus(requests, status) {
  return status ? requests.filter((request) => request.status === status) : requests
}

// Pendientes primero; el resto mantiene el orden que traía (por fecha).
// Se copia el array porque sort modifica el original (y es el estado de React).
export function sortRequestsPendingFirst(requests) {
  return [...requests].sort(
    (a, b) =>
      Number(b.status === REQUEST_STATUS.PENDING) - Number(a.status === REQUEST_STATUS.PENDING),
  )
}

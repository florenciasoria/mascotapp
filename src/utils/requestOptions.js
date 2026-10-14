// Opciones fijas del formulario de solicitud. Las reglas de Firestore validan las mismas listas.
export const HOUSING_TYPES = ['Departamento', 'Casa', 'PH']

export const HOURS_ALONE = [
  'Menos de 2 horas',
  '2 a 4 horas',
  '4 a 6 horas',
  '6 a 8 horas',
  'Más de 8 horas',
]

export const EXPERIENCE_RANGES = ['Menos de 1 año', '1 a 5 años', 'Más de 5 años']

export const REQUEST_STATUS = {
  PENDING: 'pendiente',
  ACCEPTED: 'aceptada',
  REJECTED: 'rechazada',
  CANCELLED: 'cancelada',
}

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Pendiente',
  [REQUEST_STATUS.ACCEPTED]: 'Aceptada',
  [REQUEST_STATUS.REJECTED]: 'Rechazada',
  [REQUEST_STATUS.CANCELLED]: 'Cancelada',
}

// Color del punto de estado (StatusBadge), como en el diseño
export const REQUEST_STATUS_TONES = {
  [REQUEST_STATUS.PENDING]: 'warning',
  [REQUEST_STATUS.ACCEPTED]: 'success',
  [REQUEST_STATUS.REJECTED]: 'danger',
  [REQUEST_STATUS.CANCELLED]: 'neutral',
}


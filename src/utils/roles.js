// Roles y estados de las cuentas, con sus textos y colores.
export const ROLES = {
  ADOPTER: 'adoptante',
  SHELTER: 'refugio',
  ADMIN: 'admin',
}

export const STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
  INACTIVE: 'inactivo',
}

// Inicio de cada rol
const HOME_PATHS = {
  [ROLES.ADOPTER]: '/adoptante',
  [ROLES.SHELTER]: '/refugio',
  [ROLES.ADMIN]: '/admin',
}

/**
 * Ruta de inicio de un rol.
 * @param {string} role
 * @returns {string} La ruta, o una inexistente (página 404) si el rol no es válido.
 */
export function getHomePath(role) {
  return HOME_PATHS[role] ?? '/no-encontrado'
}

export const ROLE_LABELS = {
  [ROLES.ADOPTER]: 'Adoptante',
  [ROLES.SHELTER]: 'Refugio',
  [ROLES.ADMIN]: 'Administrador',
}

export const STATUS_LABELS = {
  [STATUS.PENDING]: 'Pendiente de aprobación',
  [STATUS.APPROVED]: 'Activo',
  [STATUS.REJECTED]: 'Rechazado',
  [STATUS.INACTIVE]: 'Desactivado',
}

// Color de la pastilla de cada estado
export const STATUS_TONES = {
  [STATUS.PENDING]: 'warning',
  [STATUS.APPROVED]: 'success',
  [STATUS.REJECTED]: 'danger',
  [STATUS.INACTIVE]: 'neutral',
}

// Roles y estados de usuario. Se usan en toda la app para no escribir
// los textos a mano (un error de tipeo sería un bug difícil de encontrar).
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

// Pantalla de inicio de cada rol
const HOME_PATHS = {
  [ROLES.ADOPTER]: '/adoptante',
  [ROLES.SHELTER]: '/refugio',
  [ROLES.ADMIN]: '/admin',
}

// Si el rol no es válido, devuelve una ruta inexistente (muestra la página 404)
export function getHomePath(role) {
  return HOME_PATHS[role] ?? '/no-encontrado'
}

// Nombre de cada rol para mostrar en pantalla
export const ROLE_LABELS = {
  [ROLES.ADOPTER]: 'Adoptante',
  [ROLES.SHELTER]: 'Refugio',
  [ROLES.ADMIN]: 'Administrador',
}

// Cómo se muestra cada estado en pantalla
export const STATUS_LABELS = {
  [STATUS.PENDING]: 'Pendiente de aprobación',
  [STATUS.APPROVED]: 'Activo',
  [STATUS.REJECTED]: 'Rechazado',
  [STATUS.INACTIVE]: 'Desactivado',
}

// Color de la pastilla de estado (StatusBadge) para cada estado de usuario
export const STATUS_TONES = {
  [STATUS.PENDING]: 'warning',
  [STATUS.APPROVED]: 'success',
  [STATUS.REJECTED]: 'danger',
  [STATUS.INACTIVE]: 'neutral',
}

import { ROLES } from './roles'

// Opciones del menú lateral de cada rol.
// "end: true" marca Inicio como activo solo en su ruta exacta.
export const MENUS = {
  [ROLES.ADOPTER]: {
    main: [
      { to: '/adoptante', label: 'Inicio', end: true },
      { to: '/adoptante/buscar', label: 'Buscar mascotas' },
      { to: '/adoptante/solicitudes', label: 'Mis solicitudes' },
      { to: '/adoptante/historial', label: 'Historial de adopciones' },
      { to: '/adoptante/donaciones', label: 'Mis donaciones' },
    ],
    profile: { to: '/adoptante/perfil', label: 'Mi perfil' },
  },
  [ROLES.SHELTER]: {
    main: [
      { to: '/refugio', label: 'Inicio', end: true },
      { to: '/refugio/mascotas', label: 'Mis mascotas' },
      { to: '/refugio/solicitudes', label: 'Solicitudes de adopción' },
      { to: '/refugio/historial', label: 'Historial de adopciones' },
    ],
    profile: { to: '/refugio/perfil', label: 'Mi refugio' },
  },
  [ROLES.ADMIN]: {
    main: [
      { to: '/admin', label: 'Inicio', end: true },
      { to: '/admin/usuarios', label: 'Gestionar usuarios' },
      { to: '/admin/supervision', label: 'Supervisar plataforma' },
    ],
    profile: { to: '/admin/perfil', label: 'Mi perfil' },
  },
}

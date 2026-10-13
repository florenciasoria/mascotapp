// Filtros de "Gestionar usuarios". Un filtro vacío ('') significa "todos".
export const EMPTY_USER_FILTERS = {
  search: '',
  role: '',
  status: '',
}

// Pasa a minúsculas y quita las tildes: así "lucia" encuentra a "Lucía"
function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Devuelve los usuarios que cumplen todos los filtros elegidos
export function filterUsers(users, filters) {
  const search = normalize(filters.search.trim())

  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false
    if (filters.status && user.status !== filters.status) return false
    if (search && !normalize(`${user.name} ${user.email}`).includes(search)) return false
    return true
  })
}

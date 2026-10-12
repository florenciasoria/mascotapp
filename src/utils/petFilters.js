// Filtros de la búsqueda de mascotas. Un filtro vacío ('') significa "cualquiera".
export const EMPTY_FILTERS = {
  species: '',
  sex: '',
  ageFrom: '',
  ageTo: '',
  size: '',
  color: '',
  neighborhood: '',
}

// Opciones de edad en años: 0 a 15
export const AGE_FILTER_OPTIONS = Array.from({ length: 16 }, (_, years) => ({
  value: String(years),
  label: years === 1 ? '1 año' : `${years} años`,
}))

// Valida los filtros (curso alternativo 4.a del CU002: criterios inválidos)
export function validateFilters(filters) {
  const hasBothAges = filters.ageFrom !== '' && filters.ageTo !== ''
  if (hasBothAges && Number(filters.ageFrom) > Number(filters.ageTo)) {
    return 'La edad "desde" no puede ser mayor que la edad "hasta"'
  }
  return ''
}

// Devuelve las mascotas que cumplen todos los filtros elegidos
export function filterPets(pets, filters) {
  return pets.filter((pet) => {
    if (filters.species && pet.species !== filters.species) return false
    if (filters.sex && pet.sex !== filters.sex) return false
    if (filters.size && pet.size !== filters.size) return false
    if (filters.color && pet.color !== filters.color) return false
    if (filters.neighborhood && pet.neighborhood !== filters.neighborhood) return false

    // Edad: "desde X años" = X*12 meses o más; "hasta Y años" = menos de (Y+1)*12 meses
    if (filters.ageFrom !== '' && pet.ageInMonths < Number(filters.ageFrom) * 12) return false
    if (filters.ageTo !== '' && pet.ageInMonths >= (Number(filters.ageTo) + 1) * 12) return false

    return true
  })
}

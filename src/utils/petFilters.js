// Filtros de la búsqueda de mascotas. Un valor vacío significa "sin filtro".
export const EMPTY_FILTERS = {
  species: '',
  sex: '',
  ageFrom: '',
  ageTo: '',
  size: '',
  color: '',
  neighborhood: '',
}

// Opciones de edad: de 0 a 15 años
export const AGE_FILTER_OPTIONS = Array.from({ length: 16 }, (_, years) => ({
  value: String(years),
  label: years === 1 ? '1 año' : `${years} años`,
}))

/**
 * Valida los filtros (CU002, curso alternativo: criterios inválidos).
 * @param {object} filters
 * @returns {string} Mensaje de error, o "" si son válidos.
 */
export function validateFilters(filters) {
  const hasBothAges = filters.ageFrom !== '' && filters.ageTo !== ''
  if (hasBothAges && Number(filters.ageFrom) > Number(filters.ageTo)) {
    return 'La edad "desde" no puede ser mayor que la edad "hasta"'
  }
  return ''
}

/**
 * Mascotas que cumplen todos los filtros.
 * @param {object[]} pets
 * @param {object} filters
 * @returns {object[]}
 */
export function filterPets(pets, filters) {
  return pets.filter((pet) => {
    if (filters.species && pet.species !== filters.species) return false
    if (filters.sex && pet.sex !== filters.sex) return false
    if (filters.size && pet.size !== filters.size) return false
    if (filters.color && pet.color !== filters.color) return false
    if (filters.neighborhood && pet.neighborhood !== filters.neighborhood) return false

    // Edad: "desde X" = X*12 meses o más; "hasta Y" = menos de (Y+1)*12 meses
    if (filters.ageFrom !== '' && pet.ageInMonths < Number(filters.ageFrom) * 12) return false
    if (filters.ageTo !== '' && pet.ageInMonths >= (Number(filters.ageTo) + 1) * 12) return false

    return true
  })
}

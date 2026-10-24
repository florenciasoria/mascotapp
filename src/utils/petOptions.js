// Opciones de las mascotas (las reglas de Firestore validan las mismas listas).
export const SPECIES = ['Perro', 'Gato']
export const SEXES = ['Macho', 'Hembra']
export const SIZES = ['Pequeño', 'Mediano', 'Grande']
export const COLORS = [
  'Negro',
  'Blanco',
  'Gris',
  'Marrón',
  'Naranja',
  'Atigrado',
  'Tricolor',
  'Mixto',
]

export const AGE_UNITS = [
  { value: 'meses', label: 'Meses' },
  { value: 'años', label: 'Años' },
]

export const PET_STATUS = {
  AVAILABLE: 'disponible',
  UNAVAILABLE: 'no_disponible',
  ADOPTED: 'adoptada',
}

export const PET_STATUS_LABELS = {
  [PET_STATUS.AVAILABLE]: 'Disponible',
  [PET_STATUS.UNAVAILABLE]: 'No disponible',
  [PET_STATUS.ADOPTED]: 'Adoptada',
}

/**
 * "adoptado" o "adoptada" según el sexo de la mascota.
 * Las solicitudes anteriores a este cambio no guardan el sexo: usan "adoptada".
 * @param {string} [sex]
 * @returns {string}
 */
export function adoptedWord(sex) {
  return sex === 'Macho' ? 'adoptado' : 'adoptada'
}

/**
 * Texto del estado de una mascota, concordando "Adoptado/a" con su sexo.
 * @param {object} pet
 * @returns {string}
 */
export function getPetStatusLabel(pet) {
  if (pet.status === PET_STATUS.ADOPTED) {
    const word = adoptedWord(pet.sex)
    return word[0].toUpperCase() + word.slice(1)
  }
  return PET_STATUS_LABELS[pet.status]
}

/**
 * Edad en meses, unidad común para comparar y filtrar.
 * @param {number} value
 * @param {'meses'|'años'} unit
 * @returns {number}
 */
export function toMonths(value, unit) {
  return unit === 'años' ? value * 12 : value
}

// Valores iniciales del formulario de mascota
export const EMPTY_PET_VALUES = {
  name: '',
  species: '',
  breed: '',
  sex: '',
  ageValue: '',
  ageUnit: '',
  size: '',
  color: '',
  description: '',
}

/**
 * Edad con su unidad: "1 mes", "3 meses", "1 año", "2 años".
 * @param {number} value
 * @param {'meses'|'años'} unit
 * @returns {string}
 */
export function formatAge(value, unit) {
  if (value === 1) {
    return unit === 'años' ? '1 año' : '1 mes'
  }
  return `${value} ${unit}`
}

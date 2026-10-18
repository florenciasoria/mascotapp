import { ROLES } from './roles'
import { NEIGHBORHOODS } from './neighborhoods'
import { AGE_UNITS, COLORS, SEXES, SIZES, SPECIES } from './petOptions'
import { EXPERIENCE_RANGES, HOURS_ALONE, HOUSING_TYPES } from './requestOptions'

// Límites compartidos con las reglas de Firestore (firestore.rules).
export const LIMITS = {
  name: { min: 2, max: 80 },
  phone: { min: 6, max: 20 },
  address: { min: 5, max: 200 },
  about: { min: 10, max: 500 },
  password: { min: 8 },
  petName: { min: 2, max: 40 },
  breed: { min: 2, max: 40 },
  petDescription: { min: 10, max: 500 },
  age: { min: 0, max: 30 },
  householdMembers: { min: 2, max: 200 },
  otherPets: { min: 2, max: 100 },
  requestText: { min: 10, max: 1000 },
  ratingComment: { max: 500 },
  donation: { min: 100, max: 1000000 },
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[\d\s-]+$/

function hasLength(value, { min, max }) {
  const length = value.trim().length
  return length >= min && length <= max
}

// Datos de perfil: se validan igual en el registro y al editar el perfil
export function validateProfileForm(values, role) {
  const errors = {}

  if (!hasLength(values.name, LIMITS.name)) {
    errors.name =
      role === ROLES.SHELTER
        ? 'Ingresá el nombre del refugio'
        : 'Ingresá tu nombre y apellido'
  }

  if (!hasLength(values.phone, LIMITS.phone) || !PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Ingresá un teléfono válido'
  }

  if (!hasLength(values.address, LIMITS.address)) {
    errors.address = 'Ingresá una dirección'
  }

  if (role === ROLES.SHELTER && !NEIGHBORHOODS.includes(values.neighborhood)) {
    errors.neighborhood = 'Elegí el barrio del refugio'
  }

  if (role === ROLES.SHELTER && !hasLength(values.about, LIMITS.about)) {
    errors.about = 'Contá brevemente sobre el refugio (mínimo 10 caracteres)'
  }

  return errors
}

// Registro = datos de perfil + email y contraseña
export function validateRegisterForm(values, role) {
  const errors = validateProfileForm(values, role)

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido'
  }

  const { password } = values
  if (password.length < LIMITS.password.min || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres, con letras y números'
  }

  return errors
}


export function validateLoginForm(values) {
  const errors = {}

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido'
  }
  if (!values.password) {
    errors.password = 'Ingresá tu contraseña'
  }

  return errors
}

export function validateForgotPasswordForm(values) {
  const errors = {}

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido'
  }

  return errors
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_MB = 15

// imageFile: foto nueva elegida (o null). hasCurrentImage: al editar, si ya tiene foto.
export function validatePetForm(values, imageFile, hasCurrentImage) {
  const errors = {}

  if (!hasLength(values.name, LIMITS.petName)) {
    errors.name = 'Ingresá el nombre de la mascota'
  }
  if (!SPECIES.includes(values.species)) {
    errors.species = 'Elegí la especie'
  }
  if (!hasLength(values.breed, LIMITS.breed)) {
    errors.breed = 'Ingresá la raza (si no la sabés, poné "Mestizo")'
  }
  if (!SEXES.includes(values.sex)) {
    errors.sex = 'Elegí el sexo'
  }

  const age = Number(values.ageValue)
  if (values.ageValue === '' || !Number.isInteger(age) || age < LIMITS.age.min || age > LIMITS.age.max) {
    errors.ageValue = 'Ingresá una edad entre 0 y 30'
  }
  if (!AGE_UNITS.some((unit) => unit.value === values.ageUnit)) {
    errors.ageUnit = 'Elegí meses o años'
  }

  if (!SIZES.includes(values.size)) {
    errors.size = 'Elegí el tamaño'
  }
  if (!COLORS.includes(values.color)) {
    errors.color = 'Elegí el color'
  }

  // La foto original puede pesar hasta 15 MB: antes de subirla se achica a ~200 KB
  if (imageFile) {
    if (!IMAGE_TYPES.includes(imageFile.type)) {
      errors.image = 'La foto tiene que ser JPG, PNG o WEBP'
    } else if (imageFile.size > MAX_IMAGE_MB * 1024 * 1024) {
      errors.image = `La foto es demasiado grande (máximo ${MAX_IMAGE_MB} MB)`
    }
  } else if (!hasCurrentImage) {
    errors.image = 'Subí una foto de la mascota'
  }

  if (!hasLength(values.description, LIMITS.petDescription)) {
    errors.description = 'Contá un poco sobre la mascota (mínimo 10 caracteres)'
  }

  return errors
}

// Formulario de solicitud de adopción
export function validateRequestForm(values) {
  const errors = {}
  const chooseOption = 'Elegí una opción'

  if (!HOUSING_TYPES.includes(values.housingType)) {
    errors.housingType = 'Elegí el tipo de vivienda'
  }
  if (!HOURS_ALONE.includes(values.hoursAlone)) {
    errors.hoursAlone = 'Elegí cuántas horas pasaría solo'
  }
  if (!hasLength(values.householdMembers, LIMITS.householdMembers)) {
    errors.householdMembers = 'Contanos quiénes viven en tu hogar'
  }
  if (!['si', 'no'].includes(values.hasYard)) {
    errors.hasYard = chooseOption
  }
  if (values.hasYard === 'si' && !['si', 'no'].includes(values.hasSafetyNet)) {
    errors.hasSafetyNet = chooseOption
  }
  if (!['si', 'no'].includes(values.hasOtherPets)) {
    errors.hasOtherPets = chooseOption
  }
  if (values.hasOtherPets === 'si' && !hasLength(values.otherPetsDetail, LIMITS.otherPets)) {
    errors.otherPetsDetail = 'Contanos qué mascotas tenés'
  }
  if (!['si', 'no'].includes(values.hasExperience)) {
    errors.hasExperience = chooseOption
  }
  if (values.hasExperience === 'si' && !EXPERIENCE_RANGES.includes(values.experienceYears)) {
    errors.experienceYears = 'Elegí cuánta experiencia tenés'
  }
  if (!hasLength(values.aboutAdopter, LIMITS.requestText)) {
    errors.aboutAdopter = 'Contanos un poco sobre vos (mínimo 10 caracteres)'
  }
  if (!hasLength(values.motivation, LIMITS.requestText)) {
    errors.motivation = 'Contanos qué te motivó a adoptar (mínimo 10 caracteres)'
  }

  return errors
}

// Formulario de calificación: los dos puntajes son obligatorios; el comentario, opcional
export function validateRatingForm(values) {
  const errors = {}
  const isValidScore = (value) => ['1', '2', '3', '4', '5'].includes(value)

  if (!isValidScore(values.shelterScore)) {
    errors.shelterScore = 'Elegí de 1 a 5 estrellas'
  }
  if (!isValidScore(values.processScore)) {
    errors.processScore = 'Elegí de 1 a 5 estrellas'
  }
  if (values.comment.trim().length > LIMITS.ratingComment.max) {
    errors.comment = `El comentario puede tener hasta ${LIMITS.ratingComment.max} caracteres`
  }

  return errors
}

// Vencimiento MM/AA: mes válido y no vencido
function isValidExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

// Formulario de donación simulada. Los datos de la tarjeta se validan para que el formulario
// sea realista, pero solo se guardan los últimos 4 dígitos.
export function validateDonationForm(values) {
  const errors = {}
  const amount = Number(values.amount)

  if (!Number.isInteger(amount) || amount < LIMITS.donation.min || amount > LIMITS.donation.max) {
    errors.amount = 'Ingresá un importe entre $100 y $1.000.000, sin centavos'
  }
  if (!/^\d{16}$/.test(values.cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Ingresá los 16 números de la tarjeta'
  }
  if (!hasLength(values.cardHolder, LIMITS.name)) {
    errors.cardHolder = 'Ingresá el nombre como figura en la tarjeta'
  }
  if (!isValidExpiry(values.expiry)) {
    errors.expiry = 'Ingresá un vencimiento válido (MM/AA)'
  }
  if (!/^\d{3,4}$/.test(values.cvv.trim())) {
    errors.cvv = 'Ingresá el código de 3 o 4 números'
  }

  return errors
}


import { ROLES } from './roles'
import { NEIGHBORHOODS } from './neighborhoods'

// Límites compartidos con las reglas de Firestore (firestore.rules).
export const LIMITS = {
  name: { min: 2, max: 80 },
  phone: { min: 6, max: 20 },
  address: { min: 5, max: 200 },
  about: { min: 10, max: 500 },
  password: { min: 8 },
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

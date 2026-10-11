import { ROLES } from './roles'

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

// Devuelve un objeto { campo: 'mensaje de error' }. Vacío = formulario válido.
export function validateRegisterForm(values, role) {
  const errors = {}

  if (!hasLength(values.name, LIMITS.name)) {
    errors.name =
      role === ROLES.SHELTER
        ? 'Ingresá el nombre del refugio'
        : 'Ingresá tu nombre y apellido'
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido'
  }

  if (!hasLength(values.phone, LIMITS.phone) || !PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Ingresá un teléfono válido'
  }

  const { password } = values
  if (password.length < LIMITS.password.min || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres, con letras y números'
  }

  if (!hasLength(values.address, LIMITS.address)) {
    errors.address = 'Ingresá una dirección'
  }

  if (role === ROLES.SHELTER && !hasLength(values.about, LIMITS.about)) {
    errors.about = 'Contá brevemente sobre el refugio (mínimo 10 caracteres)'
  }

  return errors
}

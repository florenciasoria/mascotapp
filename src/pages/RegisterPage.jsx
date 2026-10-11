import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'
import { getAuthErrorMessage, registerUser } from '../services/authService'
import { LIMITS, validateRegisterForm } from '../utils/validators'
import { ROLES } from '../utils/roles'
import styles from './RegisterPage.module.css'

const INITIAL_VALUES = {
  name: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  about: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState(ROLES.ADOPTER)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isShelter = role === ROLES.SHELTER

  function handleRoleChange(newRole) {
    setRole(newRole)
    setErrors({})
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateRegisterForm(values, role)
    setErrors(validationErrors)

    // Si hay errores, llevamos el foco al primer campo inválido
    const firstInvalidField = Object.keys(validationErrors)[0]
    if (firstInvalidField) {
      event.target.elements[firstInvalidField].focus()
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser({ ...values, role })
      navigate(isShelter ? '/refugio' : '/adoptante', { replace: true })
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout wide>
      <header className={styles.header}>
        <h1 className={styles.title}>Registrate</h1>
        <p id="account-type-label" className={styles.subtitle}>
          ¿Qué tipo de cuenta querés crear?
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.roleSelector} role="radiogroup" aria-labelledby="account-type-label">
          <label className={styles.roleOption}>
            <input
              type="radio"
              name="role"
              value={ROLES.ADOPTER}
              checked={role === ROLES.ADOPTER}
              onChange={() => handleRoleChange(ROLES.ADOPTER)}
            />
            <span>Adoptante</span>
          </label>
          <label className={styles.roleOption}>
            <input
              type="radio"
              name="role"
              value={ROLES.SHELTER}
              checked={role === ROLES.SHELTER}
              onChange={() => handleRoleChange(ROLES.SHELTER)}
            />
            <span>Refugio</span>
          </label>
        </div>

        <div className={styles.grid}>
          <Input
            label={isShelter ? 'Nombre del refugio' : 'Nombre y apellido'}
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete={isShelter ? 'organization' : 'name'}
            maxLength={LIMITS.name.max}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Teléfono"
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            autoComplete="tel"
            maxLength={LIMITS.phone.max}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            hint="Mínimo 8 caracteres, con letras y números"
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <div className={styles.fullWidth}>
            <Input
              label="Dirección"
              name="address"
              value={values.address}
              onChange={handleChange}
              error={errors.address}
              autoComplete="street-address"
              maxLength={LIMITS.address.max}
              required
            />
          </div>
          {isShelter && (
            <div className={styles.fullWidth}>
              <Input
                label="Sobre el refugio"
                name="about"
                multiline
                value={values.about}
                onChange={handleChange}
                error={errors.about}
                maxLength={LIMITS.about.max}
                required
              />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            {isShelter ? 'Solicitar registro' : 'Crear cuenta'}
          </Button>
          {isShelter && (
            <p className={styles.note}>
              Tu cuenta deberá ser aprobada por un administrador antes de poder
              utilizar las funcionalidades del sistema.
            </p>
          )}
        </div>
      </form>

      <p className={styles.footer}>
        ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage

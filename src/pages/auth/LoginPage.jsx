import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import AuthLayout from '@/layouts/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { getAuthErrorMessage, loginUser } from '@/services/authService'
import { validateLoginForm } from '@/utils/validators'
import { getHomePath } from '@/utils/roles'
import logo from '@/assets/logo.png'
import styles from './AuthPage.module.css'

/** Inicio de sesión. Al llegar el perfil, redirige al inicio de cada rol. */
function LoginPage() {
  const { user, profile, isLoading } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Cuenta sin perfil en Firestore
  const hasMissingProfile = user && !isLoading && !profile

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateLoginForm(values)
    setErrors(validationErrors)

    const firstInvalidField = Object.keys(validationErrors)[0]
    if (firstInvalidField) {
      event.target.elements[firstInvalidField].focus()
      return
    }

    setIsSubmitting(true)
    try {
      // La redirección se hace al recibir el perfil
      await loginUser(values.email, values.password, rememberMe)
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  if (profile) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>¡Bienvenido/a!</h1>
        <p className={styles.subtitle}>Ingresá para continuar</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Ingresá tu email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Ingresá tu contraseña"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <Link to="/recuperar-contrasena" className={styles.forgotLink}>
          ¿Olvidaste tu contraseña?
        </Link>

        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          Mantener la sesión iniciada
        </label>

        <div className={styles.actions}>
          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}
          {hasMissingProfile && (
            <p className={styles.submitError} role="alert">
              Tu cuenta no tiene un perfil asociado. Contactá a un administrador.
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting && !hasMissingProfile}>
            Iniciar sesión
          </Button>
        </div>
      </form>

      <p className={styles.footer}>
        <Link to="/registro">Registrate</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage

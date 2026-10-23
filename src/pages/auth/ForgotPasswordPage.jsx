import { useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from '@/layouts/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getAuthErrorMessage, sendPasswordReset } from '@/services/authService'
import { validateForgotPasswordForm } from '@/utils/validators'
import logo from '@/assets/logo.png'
import styles from './AuthPage.module.css'

/** Recuperación de contraseña: envía un email para crear una nueva. */
function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wasSent, setWasSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateForgotPasswordForm({ email })
    setError(validationErrors.email ?? '')
    if (validationErrors.email) {
      event.target.elements.email.focus()
      return
    }

    setIsSubmitting(true)
    try {
      await sendPasswordReset(email)
      setWasSent(true)
    } catch (resetError) {
      setSubmitError(getAuthErrorMessage(resetError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>Recuperá tu contraseña</h1>
        <p className={styles.subtitle}>Te enviamos un enlace para crear una nueva</p>
      </header>

      {wasSent ? (
        <p className={styles.success} role="status">
          Si existe una cuenta con <strong>{email.trim()}</strong>, te enviamos un enlace para
          restablecer tu contraseña. Revisá tu bandeja de entrada y la carpeta de spam.
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Ingresá tu email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
            autoComplete="email"
            required
          />
          <div className={styles.actions}>
            {submitError && (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
            )}
            <Button type="submit" isLoading={isSubmitting}>
              Enviar enlace
            </Button>
          </div>
        </form>
      )}

      <p className={styles.footer}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordPage

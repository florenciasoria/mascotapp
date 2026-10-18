import { useState } from 'react'
import AuthLayout from '@/layouts/AuthLayout'
import Button from '@/components/ui/Button'
import LogoutButton from '@/components/LogoutButton'
import { useAuth } from '@/hooks/useAuth'
import { getAuthErrorMessage, resendVerificationEmail } from '@/services/authService'
import { ROLES } from '@/utils/roles'
import logo from '@/assets/logo.png'
import styles from './MessagePage.module.css'

// Se muestra hasta que el usuario verifica su email.
// También funciona como confirmación del registro.
function VerifyEmailPage() {
  const { user, profile, refreshEmailVerification } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleCheck() {
    setMessage('')
    setError('')
    setIsChecking(true)
    try {
      const verified = await refreshEmailVerification()
      if (!verified) {
        setError(
          'Todavía no verificaste tu email. Revisá tu bandeja de entrada y la carpeta de spam.',
        )
      }
    } catch (checkError) {
      setError(getAuthErrorMessage(checkError))
    } finally {
      setIsChecking(false)
    }
  }

  async function handleResend() {
    setMessage('')
    setError('')
    setIsResending(true)
    try {
      await resendVerificationEmail()
      setMessage('Te reenviamos el email de verificación.')
    } catch (resendError) {
      setError(getAuthErrorMessage(resendError))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <div className={styles.content}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>Verificá tu email</h1>
        <p className={styles.text}>
          ¡Tu cuenta fue creada! Te enviamos un enlace de verificación a{' '}
          <strong>{user?.email}</strong>. Abrilo para activar tu cuenta.
        </p>
        {/* El refugio tiene un paso más: después de verificar, lo aprueba un administrador */}
        {profile?.role === ROLES.SHELTER && (
          <p className={styles.text}>
            Después de verificarlo, un administrador va a revisar los datos de tu refugio antes de
            habilitarlo.
          </p>
        )}

        {message && <p role="status">{message}</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={handleCheck} isLoading={isChecking}>
            Ya verifiqué mi email
          </Button>
          <Button variant="link" onClick={handleResend} isLoading={isResending}>
            Reenviar email
          </Button>
          <LogoutButton />
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmailPage

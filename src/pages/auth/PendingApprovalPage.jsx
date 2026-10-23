import AuthLayout from '@/layouts/AuthLayout'
import LogoutButton from '@/components/LogoutButton'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/logo.png'
import styles from './MessagePage.module.css'

/** Pantalla para refugios pendientes de aprobación. Se actualiza sola cuando el administrador los aprueba. */
function PendingApprovalPage() {
  const { profile } = useAuth()

  return (
    <AuthLayout>
      <div className={styles.content}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>¡Recibimos tu solicitud!</h1>
        <p className={styles.text}>
          Gracias por sumar a <strong>{profile?.name}</strong> a MascotApp. Un administrador va a
          revisar los datos del refugio y, cuando tu cuenta sea aprobada, vas a poder usar todas las
          funcionalidades.
        </p>
        <p className={styles.text}>
          No hace falta que recargues: esta pantalla se actualiza sola cuando tu cuenta sea
          aprobada.
        </p>
        <LogoutButton />
      </div>
    </AuthLayout>
  )
}

export default PendingApprovalPage

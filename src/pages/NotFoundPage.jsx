import { Link } from 'react-router'
import AuthLayout from '@/layouts/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { getHomePath } from '@/utils/roles'
import logo from '@/assets/logo.png'
import styles from './auth/MessagePage.module.css'

// Dirección que no existe en la app: ofrece volver al inicio del rol (o al login)
function NotFoundPage() {
  const { profile } = useAuth()

  return (
    <AuthLayout>
      <div className={styles.content}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.text}>La dirección que buscás no existe o ya no está disponible.</p>
        <Link to={profile ? getHomePath(profile.role) : '/login'}>Volver al inicio</Link>
      </div>
    </AuthLayout>
  )
}

export default NotFoundPage

import AuthLayout from '@/layouts/AuthLayout'
import LogoutButton from '@/components/LogoutButton'
import { STATUS } from '@/utils/roles'
import logo from '@/assets/logo.png'
import styles from './MessagePage.module.css'

const MESSAGES = {
  [STATUS.REJECTED]: {
    title: 'Tu solicitud no fue aprobada',
    text: 'Un administrador revisó los datos del refugio y no aprobó el registro, por lo que no podés usar las funcionalidades de MascotApp.',
  },
  [STATUS.INACTIVE]: {
    title: 'Tu cuenta está desactivada',
    text: 'Un administrador desactivó esta cuenta, por lo que no podés usar las funcionalidades de MascotApp.',
  },
}

// Mensaje para cualquier otro estado
const DEFAULT_MESSAGE = {
  title: 'Tu cuenta no está habilitada',
  text: 'Por el momento no podés usar las funcionalidades de MascotApp.',
}

/**
 * Pantalla para cuentas no habilitadas (rechazadas, desactivadas o con un estado desconocido).
 * @param {object} props
 * @param {string} props.status - Estado de la cuenta.
 */
function AccountStatusPage({ status }) {
  const { title, text } = MESSAGES[status] ?? DEFAULT_MESSAGE

  return (
    <AuthLayout>
      <div className={styles.content}>
        <img src={logo} alt="MascotApp" className={styles.logo} />
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <p className={styles.text}>
          Si creés que se trata de un error, comunicate con un administrador de MascotApp.
        </p>
        <LogoutButton />
      </div>
    </AuthLayout>
  )
}

export default AccountStatusPage

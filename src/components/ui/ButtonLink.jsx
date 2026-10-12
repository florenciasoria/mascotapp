import { Link } from 'react-router'
import styles from './Button.module.css'

// Link con aspecto de botón: para NAVEGAR a otra pantalla.
// (Para ACCIONES como enviar o aceptar, usar Button.)
function ButtonLink({ to, variant = 'primary', children, ...props }) {
  return (
    <Link to={to} className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </Link>
  )
}

export default ButtonLink

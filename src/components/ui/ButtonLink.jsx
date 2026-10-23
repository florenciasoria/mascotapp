import { Link } from 'react-router'
import styles from './Button.module.css'

/**
 * Link con aspecto de botón, para navegar (las acciones usan Button).
 * @param {object} props
 * @param {string} props.to - Ruta de destino.
 * @param {'primary'|'secondary'|'link'|'back'} [props.variant] - Estilo.
 * @param {'md'|'sm'} [props.size] - Tamaño.
 */
function ButtonLink({ to, variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <Link
      to={to}
      className={`${styles.button} ${styles[variant]} ${size === 'sm' ? styles.sm : ''} ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

export default ButtonLink

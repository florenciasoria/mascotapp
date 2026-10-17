import styles from './StatusBadge.module.css'

// Estado como "pastilla": fondo suave, borde de color y texto, con un ícono opcional.
// El color acompaña, pero lo que informa es el texto (y el ícono ayuda a distinguir sin color).
// tone: 'success' | 'warning' | 'danger' | 'neutral'
function StatusBadge({ tone = 'neutral', icon, children }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export default StatusBadge

import styles from './StatusBadge.module.css'

/**
 * Estado en forma de pastilla. El color acompaña al texto, que es el que informa.
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'neutral'} [props.tone] - Color.
 * @param {string} [props.icon] - Ícono decorativo.
 */
function StatusBadge({ tone = 'neutral', icon, children }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export default StatusBadge

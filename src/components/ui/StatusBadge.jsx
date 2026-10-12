import styles from './StatusBadge.module.css'

// Estado con punto de color + texto. El color acompaña, pero el texto es lo que informa.
// tone: 'success' | 'warning' | 'danger' | 'neutral'
function StatusBadge({ tone = 'neutral', children }) {
  return (
    <span className={styles.badge}>
      <span className={`${styles.dot} ${styles[tone]}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export default StatusBadge

import styles from './Stars.module.css'

// Muestra un puntaje o un promedio con estrellas (solo lectura).
// showValue: además muestra el número (por ejemplo "4,3"), útil para los promedios.
function StarDisplay({ value, showValue = false }) {
  const rounded = Math.round(value)
  const text = value.toFixed(1).replace('.', ',')

  return (
    <span className={styles.display}>
      <span aria-hidden="true" className={styles.filled}>
        {'★'.repeat(rounded)}
        <span className={styles.empty}>{'☆'.repeat(5 - rounded)}</span>
      </span>
      {showValue && <span aria-hidden="true">{text}</span>}
      <span className={styles.srOnly}>{text} de 5 estrellas</span>
    </span>
  )
}

export default StarDisplay

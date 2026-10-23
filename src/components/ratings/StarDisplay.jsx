import styles from './Stars.module.css'

const POSITIONS = [1, 2, 3, 4, 5]

/**
 * Muestra un puntaje o un promedio con estrellas (solo lectura).
 * Redondea a la media estrella más cercana; el valor exacto se anuncia a los lectores de pantalla.
 * @param {object} props
 * @param {number} props.value - Puntaje de 1 a 5.
 * @param {boolean} [props.showValue] - Muestra también el número (por ejemplo, "4,3").
 */
function StarDisplay({ value, showValue = false }) {
  const rounded = Math.round(value * 2) / 2
  const text = value.toFixed(1).replace('.', ',')

  return (
    <span className={styles.display}>
      <span aria-hidden="true" className={styles.displayStars}>
        {POSITIONS.map((position) => {
          // Relleno de la estrella: 0, 0.5 o 1
          const fill = Math.min(Math.max(rounded - (position - 1), 0), 1)
          return (
            <span key={position} className={styles.slot}>
              <span className={styles.empty}>☆</span>
              {fill > 0 && (
                <span
                  className={`${styles.filled} ${styles.fill}`}
                  style={{ width: `${fill * 100}%` }}
                >
                  ★
                </span>
              )}
            </span>
          )
        })}
      </span>
      {showValue && <span aria-hidden="true">{text}</span>}
      <span className={styles.srOnly}>{text} de 5 estrellas</span>
    </span>
  )
}

export default StarDisplay

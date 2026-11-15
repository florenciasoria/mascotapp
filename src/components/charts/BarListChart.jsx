import { useId } from 'react'
import styles from './Charts.module.css'

/**
 * Barras horizontales para comparar elementos (por ejemplo, refugios). El nombre y el detalle
 * van en texto arriba de cada barra: se leen en cualquier ancho y los lee el lector de pantalla.
 * @param {object} props
 * @param {string} props.title - Título del gráfico.
 * @param {{label: string, value: number, detail: string}[]} props.data - Una barra por elemento;
 *   value define el largo y detail es el texto que la acompaña.
 */
function BarListChart({ title, data }) {
  const titleId = useId()
  const maxValue = Math.max(...data.map((item) => item.value), 0)

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>

      <ul className={styles.barList}>
        {data.map((item) => (
          <li key={item.label}>
            <p className={styles.barLabel}>
              <span>{item.label}</span>
              <span className={styles.barDetail}>{item.detail}</span>
            </p>
            <div className={styles.barTrack} aria-hidden="true">
              <div
                className={styles.barFill}
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default BarListChart

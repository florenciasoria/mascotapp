import { useId } from 'react'
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './Charts.module.css'

// Gráfico de dona: partes de un total (por ejemplo, solicitudes por estado).
// data: [{ label: 'Pendiente', value: 3, color: '#d39a12' }, ...]
// El dibujo es una ayuda visual; la leyenda (HTML) tiene los nombres y valores en texto,
// que es lo que lee el lector de pantalla.
function DonutChart({ title, data }) {
  const titleId = useId()
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>

      {total === 0 ? (
        <p className={styles.empty}>Todavía no hay datos.</p>
      ) : (
        <div className={styles.donutLayout}>
          <div className={styles.donut} aria-hidden="true">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart accessibilityLayer={false}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="95%"
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                  <Label
                    value={total}
                    position="center"
                    fill="#6b625e"
                    fontSize={24}
                    fontWeight={700}
                  />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className={styles.legend}>
            {data.map((item) => (
              <li key={item.label}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendValue}>{item.value}</span>
              </li>
            ))}
            <li className={styles.legendTotal}>
              <span className={styles.legendLabel}>Total</span>
              <span className={styles.legendValue}>{total}</span>
            </li>
          </ul>
        </div>
      )}
    </figure>
  )
}

export default DonutChart

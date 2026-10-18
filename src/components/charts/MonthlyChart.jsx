import { useId } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_COLORS } from '@/utils/chartColors'
import styles from './Charts.module.css'

// Columnas por mes (por ejemplo, donaciones de los últimos 6 meses).
// data: [{ label: 'oct 2026', value: 50000 }, ...]
// formatValue: cómo mostrar cada valor (por ejemplo, en pesos).
// Para el lector de pantalla hay una tabla con los mismos datos (oculta a la vista).
function MonthlyChart({ title, data, valueLabel, formatValue = (value) => value }) {
  const titleId = useId()

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid vertical={false} stroke="#e6e1d9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#d9d9d9' }}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <YAxis
              tickFormatter={formatValue}
              width={88}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), valueLabel]}
              cursor={{ fill: '#f7f4ed' }}
            />
            <Bar dataKey="value" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className={styles.srOnly}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{formatValue(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default MonthlyChart

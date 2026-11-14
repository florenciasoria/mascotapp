import { useId } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS } from '@/utils/chartColors'
import styles from './Charts.module.css'

/**
 * Gráfico mensual de columnas o de línea, con una tabla equivalente para lectores de pantalla.
 * @param {object} props
 * @param {string} props.title - Título del gráfico.
 * @param {{label: string, fullLabel?: string, value: number}[]} props.data - Valor de cada mes
 *   (fullLabel, el mes completo, se usa en el tooltip y en la tabla).
 * @param {string} props.valueLabel - Nombre de la magnitud (por ejemplo, "Donado").
 * @param {(value: number) => string} [props.formatValue] - Formato de cada valor.
 * @param {import('react').ReactNode} [props.actions] - Controles junto al título (por ejemplo, el período).
 * @param {'bar'|'line'} [props.variant] - Columnas (por defecto) o línea, para ver la tendencia.
 */
function MonthlyChart({
  title,
  data,
  valueLabel,
  formatValue = (value) => value,
  actions,
  variant = 'bar',
}) {
  const titleId = useId()
  const isLine = variant === 'line'
  const Chart = isLine ? LineChart : BarChart

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <figcaption className={styles.header}>
        <span id={titleId} className={styles.title}>
          {title}
        </span>
        {actions}
      </figcaption>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={240}>
          <Chart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid vertical={false} stroke="#e6e1d9" />
            <XAxis
              dataKey="label"
              padding={isLine ? { left: 24, right: 24 } : undefined}
              tickLine={false}
              axisLine={{ stroke: '#d9d9d9' }}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={formatValue}
              width={88}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), valueLabel]}
              labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
              separator=": "
              cursor={isLine ? false : { fill: '#f7f4ed' }}
            />
            {isLine ? (
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.bar}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS.bar }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Bar dataKey="value" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={48} />
            )}
          </Chart>
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
              <th scope="row">{item.fullLabel ?? item.label}</th>
              <td>{formatValue(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default MonthlyChart

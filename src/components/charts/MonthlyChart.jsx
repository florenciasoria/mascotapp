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
 * Marcas redondas del eje vertical para un valor máximo: 25.000 → 0, 10.000, 20.000, 30.000.
 * El paso es 1, 2 o 5 por una potencia de 10, y nunca menor que 1 (los valores son enteros).
 * @param {number} maxValue
 * @returns {number[]}
 */
function getRoundTicks(maxValue) {
  if (maxValue <= 0) return [0, 1]
  const roughStep = maxValue / 4
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = Math.max(
    1,
    [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= roughStep),
  )
  const ticks = [0]
  while (ticks.at(-1) < maxValue) ticks.push(ticks.at(-1) + step)
  return ticks
}

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
  const ticks = getRoundTicks(Math.max(...data.map((item) => item.value)))
  // Con muchos meses, las etiquetas se inclinan para que entren todas
  const isCrowded = data.length > 6

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
              interval={0}
              angle={isCrowded ? -35 : 0}
              textAnchor={isCrowded ? 'end' : 'middle'}
              height={isCrowded ? 56 : 30}
              tickLine={false}
              axisLine={{ stroke: '#d9d9d9' }}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <YAxis
              ticks={ticks}
              domain={[0, ticks.at(-1)]}
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
                type="linear"
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

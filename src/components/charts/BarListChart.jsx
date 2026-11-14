import { useId } from 'react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_COLORS } from '@/utils/chartColors'
import styles from './Charts.module.css'

// Alto de cada barra con su espacio, en píxeles: el gráfico crece según la cantidad de filas
const ROW_HEIGHT = 48

/**
 * Gráfico de barras horizontales para comparar elementos (por ejemplo, refugios),
 * con una tabla equivalente para lectores de pantalla.
 * @param {object} props
 * @param {string} props.title - Título del gráfico.
 * @param {{label: string, value: number, detail: string}[]} props.data - Una barra por elemento;
 *   detail es el texto que se muestra al lado de la barra.
 * @param {string} props.labelHeader - Encabezado de los nombres en la tabla (por ejemplo, "Refugio").
 * @param {string} props.valueLabel - Nombre de la magnitud (por ejemplo, "Donado").
 * @param {(value: number) => string} [props.formatValue] - Formato de cada valor.
 */
function BarListChart({ title, data, labelHeader, valueLabel, formatValue = (value) => value }) {
  const titleId = useId()

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>

      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT + 16}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 170, left: 8, bottom: 8 }}
            accessibilityLayer={false}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#776d68', fontSize: 13 }}
            />
            <Tooltip
              formatter={(value) => [formatValue(value), valueLabel]}
              separator=": "
              cursor={{ fill: '#f7f4ed' }}
            />
            <Bar dataKey="value" fill={CHART_COLORS.bar} radius={[0, 4, 4, 0]} maxBarSize={28}>
              <LabelList dataKey="detail" position="right" fill="#6b625e" fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className={styles.srOnly}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default BarListChart

/**
 * Fecha de Firestore en formato argentino (13/10/2026).
 * @param {object|null} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  return timestamp ? timestamp.toDate().toLocaleDateString('es-AR') : '—'
}

/**
 * Fecha y hora de Firestore en formato argentino (14/11/2026 15:53).
 * @param {object|null} timestamp
 * @returns {string}
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate()
  const day = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${day} ${time}`
}

/**
 * Ordena de lo más nuevo a lo más viejo según un campo de fecha.
 * Se ordena en el navegador para no requerir índices compuestos.
 * @param {object[]} items
 * @param {string} [field] - Campo de fecha (por defecto, createdAt).
 * @returns {object[]} Una copia ordenada.
 */
export function sortByNewest(items, field = 'createdAt') {
  return [...items].sort((a, b) => (b[field]?.toMillis() ?? 0) - (a[field]?.toMillis() ?? 0))
}

// Períodos para elegir en los gráficos mensuales (valor = cantidad de meses)
export const PERIOD_OPTIONS = [
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

/** Clave de un mes ("2026-10"), para saber si dos fechas caen en el mismo mes. */
function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

/**
 * Agrupa elementos por mes en los últimos meses (incluido el actual).
 * Los meses sin movimientos quedan en cero, para que el gráfico no tenga huecos.
 * @param {object[]} items
 * @param {object} options
 * @param {number} options.months - Cantidad de meses (por ejemplo, 6 o 12).
 * @param {string} [options.dateField] - Campo de fecha (por defecto, createdAt).
 * @param {(item: object) => number} [options.getValue] - Valor de cada elemento (por defecto, cuenta 1).
 * @returns {{label: string, fullLabel: string, value: number}[]} Del mes más viejo al actual.
 */
export function groupByMonth(items, { months, dateField = 'createdAt', getValue = () => 1 }) {
  const now = new Date()
  const buckets = Array.from({ length: months }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (months - 1) + index, 1)
    return {
      key: monthKey(month),
      label: month.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      fullLabel: month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
      value: 0,
    }
  })

  const bucketsByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  items.forEach((item) => {
    const date = item[dateField]?.toDate()
    const bucket = date && bucketsByKey.get(monthKey(date))
    if (bucket) bucket.value += getValue(item)
  })

  return buckets.map(({ label, fullLabel, value }) => ({ label, fullLabel, value }))
}

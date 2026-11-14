/**
 * Fecha de Firestore en formato argentino (13/10/2026).
 * @param {object|null} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  return timestamp ? timestamp.toDate().toLocaleDateString('es-AR') : '—'
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
      label: month.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }),
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


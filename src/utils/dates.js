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

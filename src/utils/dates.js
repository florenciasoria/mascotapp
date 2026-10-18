// Fecha de Firestore (Timestamp) en formato argentino, por ejemplo 13/10/2026
export function formatDate(timestamp) {
  return timestamp ? timestamp.toDate().toLocaleDateString('es-AR') : '—'
}

// Ordena de la más nueva a la más vieja según un campo de fecha (por defecto, createdAt).
// Se ordena en el navegador para no necesitar índices compuestos en Firestore.
export function sortByNewest(items, field = 'createdAt') {
  return [...items].sort((a, b) => (b[field]?.toMillis() ?? 0) - (a[field]?.toMillis() ?? 0))
}

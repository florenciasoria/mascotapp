// Fecha de Firestore (Timestamp) en formato argentino, por ejemplo 13/10/2026
export function formatDate(timestamp) {
  return timestamp ? timestamp.toDate().toLocaleDateString('es-AR') : '—'
}

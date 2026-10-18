// Supervisión del admin: totales y datos para los gráficos.
// Los conteos y las sumas se calculan en el servidor (agregaciones): no se descargan los documentos.
import {
  collection,
  count,
  getAggregateFromServer,
  getCountFromServer,
  getDocs,
  query,
  sum,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { ROLES } from '@/utils/roles'
import { PET_STATUS } from '@/utils/petOptions'
import { REQUEST_STATUS } from '@/utils/requestOptions'

// Cuántos documentos de la colección tienen ese valor en ese campo
async function countWhere(collectionName, field, value) {
  const snapshot = await getCountFromServer(
    query(collection(db, collectionName), where(field, '==', value)),
  )
  return snapshot.data().count
}

// Cuenta cada valor posible a la vez: { disponible: 5, no_disponible: 1, adoptada: 2 }
async function countByValues(collectionName, field, values) {
  const counts = await Promise.all(values.map((value) => countWhere(collectionName, field, value)))
  return Object.fromEntries(values.map((value, index) => [value, counts[index]]))
}

// Todos los números de la Supervisión, en paralelo
export async function getPlatformStats() {
  const [usersByRole, petsByStatus, requestsByStatus, donations] = await Promise.all([
    countByValues('users', 'role', [ROLES.ADOPTER, ROLES.SHELTER]),
    countByValues('pets', 'status', Object.values(PET_STATUS)),
    countByValues('adoptionRequests', 'status', Object.values(REQUEST_STATUS)),
    getAggregateFromServer(collection(db, 'donations'), { total: count(), amount: sum('amount') }),
  ])

  return { usersByRole, petsByStatus, requestsByStatus, donations: donations.data() }
}

// Importe donado en cada uno de los últimos meses: [{ label: 'oct 2026', value: 50000 }, ...]
// (se traen solo las donaciones de ese período y se suman por mes en el navegador)
export async function getDonationsByMonth(months = 6) {
  const now = new Date()
  const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const buckets = Array.from({ length: months }, (_, index) => {
    const month = new Date(since.getFullYear(), since.getMonth() + index, 1)
    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }),
      value: 0,
    }
  })

  const snapshot = await getDocs(
    query(collection(db, 'donations'), where('createdAt', '>=', since)),
  )
  snapshot.docs.forEach((donation) => {
    const { amount, createdAt } = donation.data()
    const date = createdAt?.toDate()
    if (!date) return
    const bucket = buckets.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`)
    if (bucket) bucket.value += amount
  })

  return buckets.map(({ label, value }) => ({ label, value }))
}

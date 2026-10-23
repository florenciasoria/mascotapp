// Datos de la supervisión del administrador. Los conteos y las sumas se calculan en el servidor.
import {
  collection,
  count,
  getAggregateFromServer,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  sum,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { sortByNewest } from '@/utils/dates'
import { formatCurrency } from '@/utils/donationOptions'
import { PET_STATUS } from '@/utils/petOptions'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import { ROLE_LABELS, ROLES } from '@/utils/roles'

/**
 * Cantidad de documentos de una colección con un valor en un campo.
 * @param {string} collectionName
 * @param {string} field
 * @param {string} value
 * @returns {Promise<number>}
 */
async function countWhere(collectionName, field, value) {
  const snapshot = await getCountFromServer(
    query(collection(db, collectionName), where(field, '==', value)),
  )
  return snapshot.data().count
}

/**
 * Cantidad de documentos por cada valor de un campo, por ejemplo { disponible: 5, adoptada: 2 }.
 * @param {string} collectionName
 * @param {string} field
 * @param {string[]} values
 * @returns {Promise<Object<string, number>>}
 */
async function countByValues(collectionName, field, values) {
  const counts = await Promise.all(values.map((value) => countWhere(collectionName, field, value)))
  return Object.fromEntries(values.map((value, index) => [value, counts[index]]))
}

/**
 * Totales de la plataforma: usuarios por rol, mascotas y solicitudes por estado, y donaciones.
 * @returns {Promise<{usersByRole: object, petsByStatus: object, requestsByStatus: object, donations: {total: number, amount: number|null}}>}
 */
export async function getPlatformStats() {
  const [usersByRole, petsByStatus, requestsByStatus, donations] = await Promise.all([
    countByValues('users', 'role', [ROLES.ADOPTER, ROLES.SHELTER]),
    countByValues('pets', 'status', Object.values(PET_STATUS)),
    countByValues('adoptionRequests', 'status', Object.values(REQUEST_STATUS)),
    getAggregateFromServer(collection(db, 'donations'), { total: count(), amount: sum('amount') }),
  ])

  return { usersByRole, petsByStatus, requestsByStatus, donations: donations.data() }
}

/**
 * Importe donado en cada uno de los últimos meses (se agrupa por mes en el navegador).
 * @param {number} [months] - Cantidad de meses.
 * @returns {Promise<{label: string, value: number}[]>}
 */
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

/**
 * Últimos movimientos de la plataforma: usuarios, mascotas, solicitudes, adopciones y donaciones,
 * ordenados por fecha.
 * @param {number} [maxItems] - Cantidad máxima de movimientos.
 * @returns {Promise<{date: object, text: string}[]>}
 */
export async function getRecentActivity(maxItems = 8) {
  const latest = (collectionName, dateField = 'createdAt') =>
    getDocs(query(collection(db, collectionName), orderBy(dateField, 'desc'), limit(maxItems)))

  const [users, pets, requests, resolvedRequests, donations] = await Promise.all([
    latest('users'),
    latest('pets'),
    latest('adoptionRequests'),
    latest('adoptionRequests', 'resolvedAt'),
    latest('donations'),
  ])

  const events = [
    ...users.docs
      .map((item) => item.data())
      .filter((user) => user.role !== ROLES.ADMIN)
      .map((user) => ({
        date: user.createdAt,
        text: `Nuevo ${ROLE_LABELS[user.role].toLowerCase()} registrado: ${user.name}`,
      })),
    ...pets.docs
      .map((item) => item.data())
      .map((pet) => ({
        date: pet.createdAt,
        text: `Nueva mascota publicada: ${pet.name} (${pet.shelterName})`,
      })),
    ...requests.docs
      .map((item) => item.data())
      .map((request) => ({
        date: request.createdAt,
        text: `Nueva solicitud de adopción: ${request.adopterName} quiere adoptar a ${request.pet.name}`,
      })),
    ...resolvedRequests.docs
      .map((item) => item.data())
      .filter((request) => request.status === REQUEST_STATUS.ACCEPTED)
      .map((request) => ({
        date: request.resolvedAt,
        text: `Adopción aceptada: ${request.pet.name} con ${request.adopterName}`,
      })),
    ...donations.docs
      .map((item) => item.data())
      .map((donation) => ({
        date: donation.createdAt,
        text: `Donación registrada: ${formatCurrency(donation.amount)} a ${donation.shelterName}`,
      })),
  ]

  return sortByNewest(events, 'date').slice(0, maxItems)
}

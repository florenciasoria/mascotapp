// Donaciones (colección "donations"). El pago se procesa con Mercado Pago desde Cloud Functions.
import {
  collection,
  count,
  doc,
  getAggregateFromServer,
  getDocs,
  onSnapshot,
  query,
  sum,
  where,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './firebase'
import { sortByNewest } from '@/utils/dates'
import { DONATION_STATUS } from '@/utils/donationOptions'

const donationsCollection = collection(db, 'donations')

/** Convierte un documento de Firestore en un objeto con su id. */
function toDonation(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Inicia el pago de una donación. La función del servidor valida los datos, crea la donación
 * pendiente y la orden en Mercado Pago, y devuelve la página de pago.
 * @param {string} shelterId - Refugio destinatario.
 * @param {number} amount - Importe entero en pesos.
 * @returns {Promise<string>} URL de la página de pago de Mercado Pago.
 */
export async function startDonationPayment(shelterId, amount) {
  const createDonationOrder = httpsCallable(functions, 'createDonationOrder')
  const result = await createDonationOrder({ shelterId, amount })
  return result.data.checkoutUrl
}

/**
 * Escucha en tiempo real una donación, para mostrar la confirmación del pago apenas llega.
 * @param {string} donationId
 * @param {(donation: object|null) => void} callback - Recibe null si no existe o no se puede leer.
 * @returns {() => void} Función para dejar de escuchar.
 */
export function subscribeToDonation(donationId, callback) {
  return onSnapshot(
    doc(db, 'donations', donationId),
    (snapshot) => callback(snapshot.exists() ? toDonation(snapshot) : null),
    () => callback(null),
  )
}

/**
 * Donaciones aprobadas de un adoptante, de la más nueva a la más vieja.
 * @param {string} adopterId
 * @returns {Promise<object[]>}
 */
export async function getAdopterDonations(adopterId) {
  const snapshot = await getDocs(
    query(
      donationsCollection,
      where('adopterId', '==', adopterId),
      where('status', '==', DONATION_STATUS.APPROVED),
    ),
  )
  return sortByNewest(snapshot.docs.map(toDonation))
}

/**
 * Donaciones aprobadas recibidas por un refugio, de la más nueva a la más vieja.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export async function getShelterDonations(shelterId) {
  const snapshot = await getDocs(
    query(
      donationsCollection,
      where('shelterId', '==', shelterId),
      where('status', '==', DONATION_STATUS.APPROVED),
    ),
  )
  return sortByNewest(snapshot.docs.map(toDonation))
}

/**
 * Total recibido y cantidad de donaciones aprobadas de un refugio, calculados en el servidor.
 * @param {string} shelterId
 * @returns {Promise<{total: number, amount: number|null}>}
 */
export async function getShelterDonationSummary(shelterId) {
  const snapshot = await getAggregateFromServer(
    query(
      donationsCollection,
      where('shelterId', '==', shelterId),
      where('status', '==', DONATION_STATUS.APPROVED),
    ),
    { total: count(), amount: sum('amount') },
  )
  return snapshot.data()
}

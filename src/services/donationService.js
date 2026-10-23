// Donaciones simuladas (colección "donations"). No se procesan pagos reales.
import {
  addDoc,
  collection,
  count,
  getAggregateFromServer,
  getDocs,
  query,
  serverTimestamp,
  sum,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { sortByNewest } from '@/utils/dates'
import { DONATION_STATUS, PAYMENT_METHODS } from '@/utils/donationOptions'

const donationsCollection = collection(db, 'donations')

/** Convierte un documento de Firestore en un objeto con su id. */
function toDonation(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Registra una donación simulada. De la tarjeta se guardan solo los últimos 4 dígitos;
 * el número completo y el código de seguridad no se envían.
 * @param {{uid: string, name: string}} adopter - Quien dona.
 * @param {{id: string, name: string, neighborhood: string}} shelter - Refugio destinatario.
 * @param {{amount: string|number, cardNumber: string}} payment - Importe y número de tarjeta.
 * @returns {Promise<object>}
 */
export function createDonation(adopter, shelter, { amount, cardNumber }) {
  const digits = cardNumber.replace(/\D/g, '')
  return addDoc(donationsCollection, {
    adopterId: adopter.uid,
    adopterName: adopter.name,
    shelterId: shelter.id,
    shelterName: shelter.name,
    neighborhood: shelter.neighborhood,
    amount: Number(amount),
    paymentMethod: PAYMENT_METHODS.CARD,
    cardLast4: digits.slice(-4),
    status: DONATION_STATUS.REGISTERED,
    createdAt: serverTimestamp(),
  })
}

/**
 * Donaciones realizadas por un adoptante, de la más nueva a la más vieja.
 * @param {string} adopterId
 * @returns {Promise<object[]>}
 */
export async function getAdopterDonations(adopterId) {
  const snapshot = await getDocs(query(donationsCollection, where('adopterId', '==', adopterId)))
  return sortByNewest(snapshot.docs.map(toDonation))
}

/**
 * Donaciones recibidas por un refugio, de la más nueva a la más vieja.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export async function getShelterDonations(shelterId) {
  const snapshot = await getDocs(query(donationsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toDonation))
}

/**
 * Total recibido y cantidad de donaciones de un refugio, calculados en el servidor.
 * @param {string} shelterId
 * @returns {Promise<{total: number, amount: number|null}>}
 */
export async function getShelterDonationSummary(shelterId) {
  const snapshot = await getAggregateFromServer(
    query(donationsCollection, where('shelterId', '==', shelterId)),
    { total: count(), amount: sum('amount') },
  )
  return snapshot.data()
}

// Servicio de donaciones simuladas: el único lugar que usa la colección "donations"
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

// Pasa un documento de Firestore a un objeto con su id
function toDonation(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// Registra una donación simulada. De la tarjeta solo se guardan los últimos 4 dígitos:
// el número completo y el CVV nunca salen del navegador.
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

// Donaciones que hizo un adoptante, de la más nueva a la más vieja
export async function getAdopterDonations(adopterId) {
  const snapshot = await getDocs(query(donationsCollection, where('adopterId', '==', adopterId)))
  return sortByNewest(snapshot.docs.map(toDonation))
}

// Donaciones que recibió un refugio, de la más nueva a la más vieja
export async function getShelterDonations(shelterId) {
  const snapshot = await getDocs(query(donationsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toDonation))
}

// Total recibido y cantidad de donaciones de un refugio, calculado en el servidor
export async function getShelterDonationSummary(shelterId) {
  const snapshot = await getAggregateFromServer(
    query(donationsCollection, where('shelterId', '==', shelterId)),
    { total: count(), amount: sum('amount') },
  )
  return snapshot.data()
}

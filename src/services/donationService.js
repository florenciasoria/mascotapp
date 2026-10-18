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

const donationsCollection = collection(db, 'donations')

function sortByNewest(donations) {
  return donations.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
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
    paymentMethod: 'tarjeta',
    cardLast4: digits.slice(-4),
    status: 'registrada',
    createdAt: serverTimestamp(),
  })
}

// Donaciones que hizo un adoptante, de la más nueva a la más vieja
export async function getAdopterDonations(adopterId) {
  const snapshot = await getDocs(query(donationsCollection, where('adopterId', '==', adopterId)))
  return sortByNewest(snapshot.docs.map((donation) => ({ id: donation.id, ...donation.data() })))
}

// Donaciones que recibió un refugio, de la más nueva a la más vieja
export async function getShelterDonations(shelterId) {
  const snapshot = await getDocs(query(donationsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map((donation) => ({ id: donation.id, ...donation.data() })))
}

// Total recibido y cantidad de donaciones de un refugio, calculado en el servidor
export async function getShelterDonationSummary(shelterId) {
  const snapshot = await getAggregateFromServer(
    query(donationsCollection, where('shelterId', '==', shelterId)),
    { total: count(), amount: sum('amount') },
  )
  return snapshot.data()
}

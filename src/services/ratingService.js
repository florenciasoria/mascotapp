// Calificaciones de adopciones (colección "ratings").
import {
  average,
  collection,
  count,
  doc,
  getAggregateFromServer,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { sortByNewest } from '@/utils/dates'

const ratingsCollection = collection(db, 'ratings')

/** Convierte un documento de Firestore en un objeto con su id. */
function toRating(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Registra la calificación de una adopción aceptada. Usa el ID de la solicitud,
 * por lo que cada adopción se califica una sola vez.
 * @param {object} adoption - Solicitud aceptada.
 * @param {{shelterScore: string, processScore: string, comment: string}} values
 * @returns {Promise<void>}
 */
export function createRating(adoption, values) {
  return setDoc(doc(db, 'ratings', adoption.id), {
    adopterId: adoption.adopterId,
    adopterName: adoption.adopterName,
    shelterId: adoption.shelterId,
    petName: adoption.pet.name,
    shelterScore: Number(values.shelterScore),
    processScore: Number(values.processScore),
    comment: values.comment.trim(),
    createdAt: serverTimestamp(),
  })
}

/**
 * Calificaciones hechas por un adoptante.
 * @param {string} adopterId
 * @returns {Promise<object[]>}
 */
export async function getAdopterRatings(adopterId) {
  const snapshot = await getDocs(query(ratingsCollection, where('adopterId', '==', adopterId)))
  return snapshot.docs.map(toRating)
}

/**
 * Calificaciones recibidas por un refugio, de la más nueva a la más vieja.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export async function getShelterRatings(shelterId) {
  const snapshot = await getDocs(query(ratingsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toRating))
}

/**
 * Cantidad de calificaciones y promedios de un refugio, calculados en el servidor.
 * @param {string} shelterId
 * @returns {Promise<{total: number, shelterAverage: number|null, processAverage: number|null}>}
 */
export async function getShelterRatingSummary(shelterId) {
  const snapshot = await getAggregateFromServer(
    query(ratingsCollection, where('shelterId', '==', shelterId)),
    {
      total: count(),
      shelterAverage: average('shelterScore'),
      processAverage: average('processScore'),
    },
  )
  return snapshot.data()
}

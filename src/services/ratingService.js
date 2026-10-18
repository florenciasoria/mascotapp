// Servicio de calificaciones: el único lugar que usa la colección "ratings"
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

// Pasa un documento de Firestore a un objeto con su id
function toRating(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// El adoptante califica una adopción aceptada. El ID es el de la solicitud:
// así no puede haber dos calificaciones para la misma adopción.
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

// Calificaciones que hizo un adoptante (para saber qué adopciones ya calificó)
export async function getAdopterRatings(adopterId) {
  const snapshot = await getDocs(query(ratingsCollection, where('adopterId', '==', adopterId)))
  return snapshot.docs.map(toRating)
}

// Calificaciones que recibió un refugio, de la más nueva a la más vieja
export async function getShelterRatings(shelterId) {
  const snapshot = await getDocs(query(ratingsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toRating))
}

// Resumen de un refugio calculado en el servidor: cantidad y los dos promedios.
// Si todavía no tiene calificaciones, los promedios vienen en null.
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

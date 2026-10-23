// Solicitudes de adopción (colección "adoptionRequests").
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { sortByNewest } from '@/utils/dates'
import { PET_STATUS } from '@/utils/petOptions'
import { REQUEST_STATUS } from '@/utils/requestOptions'

const requestsCollection = collection(db, 'adoptionRequests')

/** Convierte un documento de Firestore en un objeto con su id. */
function toRequest(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * ID de una solicitud: combina mascota y adoptante, para que no haya solicitudes duplicadas.
 * @param {string} petId
 * @param {string} adopterId
 * @returns {string}
 */
function getRequestId(petId, adopterId) {
  return `${petId}_${adopterId}`
}

/**
 * Indica si el adoptante tiene una solicitud vigente (no cancelada) para la mascota.
 * Usa una consulta y no una lectura por ID, porque las reglas no permiten leer un documento inexistente.
 * @param {string} petId
 * @param {string} adopterId
 * @returns {Promise<boolean>}
 */
export async function hasActiveRequestForPet(petId, adopterId) {
  const snapshot = await getDocs(
    query(requestsCollection, where('adopterId', '==', adopterId), where('petId', '==', petId)),
  )
  return snapshot.docs.some((requestDoc) => requestDoc.data().status !== REQUEST_STATUS.CANCELLED)
}

/**
 * Crea (o, si estaba cancelada, reemplaza) la solicitud de adopción de una mascota.
 * Guarda los datos de la mascota al momento de pedirla y los datos de contacto del adoptante.
 * @param {object} pet - Mascota solicitada.
 * @param {{uid: string, name: string, email: string, phone: string}} adopter - Adoptante.
 * @param {object} answers - Respuestas del formulario.
 * @returns {Promise<void>}
 */
export function createAdoptionRequest(pet, adopter, answers) {
  return setDoc(doc(db, 'adoptionRequests', getRequestId(pet.id, adopter.uid)), {
    petId: pet.id,
    shelterId: pet.shelterId,
    shelterName: pet.shelterName,
    adopterId: adopter.uid,
    adopterName: adopter.name,
    // Contacto para el refugio (el formulario lo informa antes de enviar)
    adopterContact: {
      email: adopter.email,
      phone: adopter.phone,
    },
    // Datos de la mascota al momento de pedirla
    pet: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageValue: pet.ageValue,
      ageUnit: pet.ageUnit,
      imageUrl: pet.imageUrl,
    },
    answers: {
      housingType: answers.housingType,
      hoursAlone: answers.hoursAlone,
      householdMembers: answers.householdMembers.trim(),
      hasYard: answers.hasYard === 'si',
      hasOtherPets: answers.hasOtherPets === 'si',
      hasExperience: answers.hasExperience === 'si',
      // Las preguntas de seguimiento se guardan solo si la respuesta fue "Sí"
      ...(answers.hasYard === 'si' && { hasSafetyNet: answers.hasSafetyNet === 'si' }),
      ...(answers.hasOtherPets === 'si' && { otherPetsDetail: answers.otherPetsDetail.trim() }),
      ...(answers.hasExperience === 'si' && { experienceYears: answers.experienceYears }),
      aboutAdopter: answers.aboutAdopter.trim(),
      motivation: answers.motivation.trim(),
    },
    status: REQUEST_STATUS.PENDING,
    createdAt: serverTimestamp(),
  })
}

/**
 * Solicitudes enviadas por un adoptante, de la más nueva a la más vieja.
 * @param {string} adopterId
 * @returns {Promise<object[]>}
 */
export async function getAdopterRequests(adopterId) {
  const snapshot = await getDocs(query(requestsCollection, where('adopterId', '==', adopterId)))
  return sortByNewest(snapshot.docs.map(toRequest))
}

/**
 * Solicitudes recibidas por un refugio, de la más nueva a la más vieja.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export async function getShelterRequests(shelterId) {
  const snapshot = await getDocs(query(requestsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toRequest))
}

/**
 * Cancela una solicitud pendiente. No se borra: queda registrada como cancelada (baja lógica).
 * @param {string} requestId
 * @returns {Promise<void>}
 */
export function cancelAdoptionRequest(requestId) {
  return updateDoc(doc(db, 'adoptionRequests', requestId), {
    status: REQUEST_STATUS.CANCELLED,
    resolvedAt: serverTimestamp(),
  })
}

/**
 * Una solicitud por su ID.
 * @param {string} requestId
 * @returns {Promise<object|null>} La solicitud, o null si no existe.
 */
export async function getRequest(requestId) {
  const snapshot = await getDoc(doc(db, 'adoptionRequests', requestId))
  return snapshot.exists() ? toRequest(snapshot) : null
}

/**
 * Acepta una solicitud en una transacción: la solicitud queda aceptada, la mascota adoptada
 * y las demás solicitudes pendientes de esa mascota se rechazan automáticamente.
 * Si alguna escritura falla, no se aplica ninguna.
 * @param {object} request - Solicitud a aceptar.
 * @returns {Promise<void>}
 * @throws {Error} Si la solicitud ya no está pendiente.
 */
export async function acceptAdoptionRequest(request) {
  // Las demás pendientes se buscan antes: una transacción no admite consultas.
  // El filtro por shelterId es el que habilitan las reglas de lectura.
  const pendingSnapshot = await getDocs(
    query(
      requestsCollection,
      where('shelterId', '==', request.shelterId),
      where('petId', '==', request.petId),
      where('status', '==', REQUEST_STATUS.PENDING),
    ),
  )
  const otherRefs = pendingSnapshot.docs
    .map((requestDoc) => requestDoc.ref)
    .filter((ref) => ref.id !== request.id)

  const requestRef = doc(db, 'adoptionRequests', request.id)
  const petRef = doc(db, 'pets', request.petId)

  await runTransaction(db, async (transaction) => {
    // En una transacción, todas las lecturas van antes que las escrituras
    const requestSnapshot = await transaction.get(requestRef)
    const otherSnapshots = await Promise.all(otherRefs.map((ref) => transaction.get(ref)))

    if (requestSnapshot.data().status !== REQUEST_STATUS.PENDING) {
      throw new Error('La solicitud ya no está pendiente')
    }

    const resolved = { resolvedAt: serverTimestamp(), seenByAdopter: false }

    transaction.update(requestRef, { status: REQUEST_STATUS.ACCEPTED, ...resolved })
    transaction.update(petRef, {
      status: PET_STATUS.ADOPTED,
      adoptionRequestId: request.id,
      updatedAt: serverTimestamp(),
    })
    otherSnapshots
      .filter((snapshot) => snapshot.data().status === REQUEST_STATUS.PENDING)
      .forEach((snapshot) =>
        transaction.update(snapshot.ref, {
          status: REQUEST_STATUS.REJECTED,
          autoRejected: true,
          ...resolved,
        }),
      )
  })
}

/**
 * Rechaza una solicitud. La mascota sigue disponible para otros adoptantes.
 * @param {string} requestId
 * @returns {Promise<void>}
 */
export function rejectAdoptionRequest(requestId) {
  return updateDoc(doc(db, 'adoptionRequests', requestId), {
    status: REQUEST_STATUS.REJECTED,
    resolvedAt: serverTimestamp(),
    seenByAdopter: false,
  })
}

/**
 * Marca como vista la respuesta del refugio (deja de mostrarse como novedad).
 * @param {string} requestId
 * @returns {Promise<void>}
 */
export function markRequestSeen(requestId) {
  return updateDoc(doc(db, 'adoptionRequests', requestId), { seenByAdopter: true })
}

/**
 * Cantidad de respuestas que el adoptante todavía no vio (se cuenta en el servidor).
 * @param {string} adopterId
 * @returns {Promise<number>}
 */
export async function countUnseenResponses(adopterId) {
  const snapshot = await getCountFromServer(
    query(
      requestsCollection,
      where('adopterId', '==', adopterId),
      where('seenByAdopter', '==', false),
    ),
  )
  return snapshot.data().count
}

/**
 * Cantidad de solicitudes pendientes de un refugio (se cuenta en el servidor).
 * @param {string} shelterId
 * @returns {Promise<number>}
 */
export async function countPendingRequests(shelterId) {
  const snapshot = await getCountFromServer(
    query(
      requestsCollection,
      where('shelterId', '==', shelterId),
      where('status', '==', REQUEST_STATUS.PENDING),
    ),
  )
  return snapshot.data().count
}

/**
 * Solicitudes aceptadas de un adoptante o de un refugio, de la más reciente a la más vieja.
 * @param {'adopterId'|'shelterId'} field - Campo por el que se filtra.
 * @param {string} uid
 * @returns {Promise<object[]>}
 */
async function getAdoptions(field, uid) {
  const snapshot = await getDocs(
    query(
      requestsCollection,
      where(field, '==', uid),
      where('status', '==', REQUEST_STATUS.ACCEPTED),
    ),
  )
  return sortByNewest(snapshot.docs.map(toRequest), 'resolvedAt')
}

/**
 * Adopciones aceptadas de un adoptante.
 * @param {string} adopterId
 * @returns {Promise<object[]>}
 */
export function getAdopterAdoptions(adopterId) {
  return getAdoptions('adopterId', adopterId)
}

/**
 * Adopciones aceptadas de un refugio.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export function getShelterAdoptions(shelterId) {
  return getAdoptions('shelterId', shelterId)
}

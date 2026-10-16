// Servicio de solicitudes de adopción: el único lugar que usa la colección "adoptionRequests"
import { db } from './firebase'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { PET_STATUS } from '@/utils/petOptions'


const requestsCollection = collection(db, 'adoptionRequests')

// Una sola solicitud por adoptante y mascota: el ID combina los dos
function getRequestId(petId, adopterId) {
  return `${petId}_${adopterId}`
}

// ¿El adoptante tiene una solicitud vigente (no cancelada) para esta mascota?
// Si la canceló, puede volver a solicitarla: la nueva reemplaza a la cancelada.
// (Se consulta con where y no leyendo el documento por ID: las reglas no dejan leer
// un documento que todavía no existe, pero una consulta vacía sí es válida.)
export async function hasActiveRequestForPet(petId, adopterId) {
  const snapshot = await getDocs(
    query(requestsCollection, where('adopterId', '==', adopterId), where('petId', '==', petId)),
  )
  return snapshot.docs.some((requestDoc) => requestDoc.data().status !== REQUEST_STATUS.CANCELLED)
}


export function createAdoptionRequest(pet, adopter, answers) {
  return setDoc(doc(db, 'adoptionRequests', getRequestId(pet.id, adopter.uid)), {
    petId: pet.id,
    shelterId: pet.shelterId,
    shelterName: pet.shelterName,
    adopterId: adopter.uid,
    adopterName: adopter.name,
    // Foto de la mascota al momento de pedirla (sigue visible aunque después se adopte)
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
      // Las preguntas de seguimiento solo se guardan si respondió "Sí"
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

// Solicitudes que envió un adoptante, de la más nueva a la más vieja.
// Se ordena acá (y no con orderBy) para no necesitar un índice compuesto, igual que en petService.
export async function getAdopterRequests(adopterId) {
  const snapshot = await getDocs(query(requestsCollection, where('adopterId', '==', adopterId)))
  return snapshot.docs
    .map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

// Solicitudes que recibió un refugio, de la más nueva a la más vieja
export async function getShelterRequests(shelterId) {
  const snapshot = await getDocs(query(requestsCollection, where('shelterId', '==', shelterId)))
  return snapshot.docs
    .map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

// El adoptante cancela una solicitud pendiente. No se borra: queda guardada como
// "cancelada" (igual que la baja lógica de usuarios), así el refugio sabe que desistió.
export function cancelAdoptionRequest(requestId) {
  return updateDoc(doc(db, 'adoptionRequests', requestId), {
    status: REQUEST_STATUS.CANCELLED,
    resolvedAt: serverTimestamp(),
  })
}

// Una solicitud por su ID. Si no existe o no es del usuario, las reglas no dejan leerla.
export async function getRequest(requestId) {
  const snapshot = await getDoc(doc(db, 'adoptionRequests', requestId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

// El refugio acepta una solicitud. Todo junto o nada (transacción):
// la solicitud queda aceptada, la mascota adoptada y las otras pendientes de esa
// mascota se rechazan solas, con el motivo (autoRejected). Cada adoptante lo ve como novedad.
export async function acceptAdoptionRequest(request) {
  // Las otras pendientes se buscan antes: dentro de una transacción no se pueden hacer consultas.
  // (El filtro por shelterId es el que permite la regla de lectura.)
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
    // Firestore exige hacer todas las lecturas antes de las escrituras
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

// El refugio rechaza una solicitud. La mascota sigue disponible para otros adoptantes.
export function rejectAdoptionRequest(requestId) {
  return updateDoc(doc(db, 'adoptionRequests', requestId), {
    status: REQUEST_STATUS.REJECTED,
    resolvedAt: serverTimestamp(),
    seenByAdopter: false,
  })
}


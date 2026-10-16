// Servicio de solicitudes de adopción: el único lugar que usa la colección "adoptionRequests"
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'
import { REQUEST_STATUS } from '@/utils/requestOptions'

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

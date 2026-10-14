// Servicio de solicitudes de adopción: el único lugar que usa la colección "adoptionRequests"
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from './firebase'
import { REQUEST_STATUS } from '@/utils/requestOptions'

const requestsCollection = collection(db, 'adoptionRequests')

// Una sola solicitud por adoptante y mascota: el ID combina los dos
function getRequestId(petId, adopterId) {
  return `${petId}_${adopterId}`
}

// ¿El adoptante ya envió una solicitud para esta mascota?
// (Se consulta con where y no leyendo el documento por ID: las reglas no dejan leer
// un documento que todavía no existe, pero una consulta vacía sí es válida.)
export async function hasRequestForPet(petId, adopterId) {
  const snapshot = await getDocs(
    query(requestsCollection, where('adopterId', '==', adopterId), where('petId', '==', petId)),
  )
  return !snapshot.empty
}

export function createAdoptionRequest(pet, adopter, answers) {
  return setDoc(doc(db, 'adoptionRequests', getRequestId(pet.id, adopter.uid)), {
    petId: pet.id,
    shelterId: pet.shelterId,
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

// Servicio de mascotas: el único lugar que lee y escribe la colección "pets"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { PET_STATUS, toMonths } from '@/utils/petOptions'

const petsCollection = collection(db, 'pets')

// Convierte los datos del formulario en los campos que se guardan
function buildPetFields({ name, species, breed, sex, ageValue, ageUnit, size, color, imagePath, description }) {
  const age = Number(ageValue)
  return {
    name: name.trim(),
    species,
    breed: breed.trim(),
    sex,
    ageValue: age,
    ageUnit,
    ageInMonths: toMonths(age, ageUnit),
    size,
    color,
    imagePath,
    description: description.trim(),
  }
}

// Pasa un documento de Firestore a un objeto con su id
function toPet(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// Ordena de la más nueva a la más vieja (se ordena acá para no necesitar un índice compuesto)
function sortByNewest(pets) {
  return pets.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

// El nombre y el barrio del refugio se copian en la mascota (desnormalización):
// así el adoptante puede ver y filtrar por barrio sin leer el perfil del refugio.
export function createPet(shelterId, shelterProfile, petData) {
  return addDoc(petsCollection, {
    ...buildPetFields(petData),
    shelterId,
    shelterName: shelterProfile.name,
    neighborhood: shelterProfile.neighborhood,
    status: PET_STATUS.AVAILABLE,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updatePet(petId, petData) {
  return updateDoc(doc(db, 'pets', petId), {
    ...buildPetFields(petData),
    updatedAt: serverTimestamp(),
  })
}

export function setPetStatus(petId, status) {
  return updateDoc(doc(db, 'pets', petId), { status, updatedAt: serverTimestamp() })
}

export async function getPet(petId) {
  const snapshot = await getDoc(doc(db, 'pets', petId))
  return snapshot.exists() ? toPet(snapshot) : null
}

// Mascotas de un refugio (todas, en cualquier estado)
export async function getShelterPets(shelterId) {
  const snapshot = await getDocs(query(petsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toPet))
}

// Mascotas que se pueden adoptar (los filtros se aplican después, en el navegador)
export async function getAvailablePets() {
  const snapshot = await getDocs(
    query(petsCollection, where('status', '==', PET_STATUS.AVAILABLE)),
  )
  return sortByNewest(snapshot.docs.map(toPet))
}